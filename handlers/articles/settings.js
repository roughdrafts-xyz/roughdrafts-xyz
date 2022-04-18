const { render } = require('server/reply')
const prisma = require('../../prisma')

const getSettings = async ctx => {
  const { id } = ctx.session.user
  if (!id) return null

  const post = await prisma.article.findUnique({
    where: { displayId: ctx.params.displayId }
  })

  if (id !== post.authorId) {
    return null
  } else {
    return render('articleSettings', {
      ...post,
      updateStatus: ''
    })
  }
}

const updateSettings = async ctx => {
  const { id } = ctx.session.user
  if (!id) return null

  const { title, summary, displayId, visibility } = ctx.body
  const post = await prisma.article.findUnique({
    where: { displayId }
  })

  if (id !== post.authorId) {
    return null
  }

  try {
    const post = await prisma.article.update({
      where: { displayId: ctx.params.displayId },
      data: {
        title,
        summary,
        displayId,
        visibility
      }
    })

    return render('articleSettings', {
      ...post,
      updateStatus:
        "<section role='status'>Settings saved succesfully.</section>"
    })
  } catch (e) {
    console.error(e)
    const user = await prisma.user.findUnique({
      where: { id }
    })
    return render('userSettings', {
      ...user,
      updateStatus:
        "<section role='alert'>An error occured. Please try again.</section>"
    })
  }
}
module.exports = {
  // Private or Public Post
  // Title
  // Eventually, RBAC stuff?
  // Summary?
  // Emoji?
  // File or Editor type? (Markdown, Plaintext)
  getSettings,
  updateSettings
}
