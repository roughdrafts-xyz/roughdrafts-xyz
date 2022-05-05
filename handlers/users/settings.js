const { render } = require('server/reply')
const prisma = require('../../prisma')
const { logout } = require('../login')

const shouldModify = (ctx, user) => {
  const isUser = ctx.session?.user?.id === user.id

  if (isUser) return true
  return false
}

const viewSettings = async ctx => {
  const { id } = ctx.session.user
  if (!id) throw new Error('Illegal Action')
  const user = await prisma.user.findUnique({
    where: { id }
  })
  if (!user) throw new Error('Illegal Action')
  // Expose download link to personal sqlite db
  return render('userSettings', {
    ...user,
    updateStatus: ''
  })
}

const updateSettings = async ctx => {
  const { id } = ctx.session.user
  if (!id) throw new Error('Illegal Action')
  const { displayId, name, summary } = ctx.body
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { displayId, name, summary }
    })
    ctx.session.user = user
    // do settings updates
    return render('userSettings', {
      ...user,
      updateStatus:
        "<section role='status'>Settings saved succesfully.</section>"
    })
  } catch (e) {
    console.error(e)

    let updateStatus = ''
    if (e.meta.target.includes('displayId')) {
      updateStatus = /* html */ `<section role='alert'>The URL Endpoint "${displayId}" has already been taken.</section>`
    } else {
      updateStatus =
        "<section role='alert'>An unhandled error occured..</section>"
    }
    const user = await prisma.user.findUnique({
      where: { id }
    })
    return render('userSettings', {
      ...user,
      updateStatus
    })
  }
}

const deleteUser = async ctx => {
  const { id } = ctx.session.user
  if (!id) throw new Error('Illegal Action')

  const user = await prisma.user.findUnique({
    where: { id }
  })

  if (!shouldModify(ctx, user)) throw new Error('Illegal Action')
  if (ctx.body.deleteMe !== user.displayId) throw new Error('Illegal Action')
  const deletePosts = prisma.article.deleteMany({ where: { authorId: id } })
  const deleteUser = prisma.user.delete({ where: { id } })
  await prisma.$transaction([deletePosts, deleteUser])
  return await logout(ctx)
}

module.exports = {
  viewSettings,
  updateSettings,
  deleteUser
}
