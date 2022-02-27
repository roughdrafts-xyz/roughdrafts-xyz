const { render } = require('server/reply')
const prisma = require('../../prisma')

const getSettings = async ctx => {
  const { id } = ctx.session.user
  if (!id) return null

  const post = await prisma.article.findUnique({
    where: { displayId: ctx.params.fileId }
  })

  return render('articleSettings', post)
}

const updateSettings = async ctx => {
  const { isPrivate } = ctx.body
  const post = await prisma.article.update({
    where: { displayId: ctx.params.fileId },
    data: {
      isPrivate
    }
  })

  return render('articleSettings', post)
}
module.exports = [
  // Private or Public Post
  // Title
  // Eventually, RBAC stuff?
  // Summary?
  // Emoji?
  // File or Editor type? (Markdown, Plaintext)
  getSettings,
  updateSettings
]
