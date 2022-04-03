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
  if (!id) return null
  const user = await prisma.user.findUnique({
    where: { id }
  })
  if (!user) return null
  // Expose download link to personal sqlite db
  return render('userSettings', user)
}

const updateSettings = async ctx => {
  const { id } = ctx.session.user
  if (!id) return null
  const { displayId, name, summary } = ctx.body
  const user = await prisma.user.update({
    where: { id },
    data: { displayId, name, summary }
  })
  ctx.session.user = user
  // do settings updates
  return render('userSettings', user)
}

const deleteUser = async ctx => {
  const { id } = ctx.session.user
  if (!id) return null

  const user = await prisma.user.findUnique({
    where: { id }
  })

  if (!shouldModify(ctx, user)) return null
  if (ctx.body.deleteMe !== user.displayId) return null
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
