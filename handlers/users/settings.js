const { render } = require('server/reply')
const prisma = require('../../prisma')

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
}

module.exports = {
  viewSettings,
  updateSettings,
  deleteUser
}
