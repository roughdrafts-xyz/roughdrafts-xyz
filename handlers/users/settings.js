const { render } = require('server/reply')
const prisma = require('../../prisma')

const viewSettings = async ctx => {
  const { id } = ctx.session.user
  if (!id) return null
  const user = await prisma.user.findUnique({
    where: { id },
    include: { profile: true }
  })
  if (!user) return null
  // Expose download link to personal sqlite db
  return render('userSettings', user)
}

const updateSettings = async ctx => {
  const { id } = ctx.session.user
  if (!id) return null
  const { displayId } = ctx.body
  const user = await prisma.user.update({ where: id, data: { displayId } })
  // do settings updates
  return render('userSettings', user)
}

module.exports = {
  viewSettings,
  updateSettings
}
