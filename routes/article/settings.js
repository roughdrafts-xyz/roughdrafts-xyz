// Private or Public Post
// Title
// Eventually, RBAC stuff?
// Summary?
// Emoji?
// File or Editor type? (Markdown, Plaintext)
get('/:fileId/settings', async (request, reply) => {
  const { id } = request.session.user
  if (!id) return null

  const post = await prisma.article.findUnique({
    where: { displayId: request.fileId }
  })

  reply.send(views.articleSettings(post))
})

post('/:fileId/settings', async (request, reply) => {
  const { isPrivate } = request.body
  const post = await prisma.article.update({
    where: { displayId: request.fileId },
    data: {
      isPrivate
    }
  })
  reply.send(views.articleSettings(post))
})
