// File Stuff
get('/:fileId/raw', async (request, reply) => {
  const post = await prisma.article.findUnique({
    where: { displayId: request.fileId }
  })

  reply.send(views.viewRaw(post))
})
get('/:fileId/edit', async (request, reply) => {
  const { id } = request.session.user

  const post = await prisma.article.findUnique({
    where: { displayId: request.fileId }
  })

  if (id !== post.authorId) {
    reply.redirect(`/${request.fileId}/raw`)
  } else {
    // cache will be able to handle anything important here
    reply.send(views.edit({ post }))
  }
})
post('/:fileId/edit', async (request, reply) => {
  const { id } = request.session.user
  if (!id) return null

  // just write the new file to the database
  // do category and spam detection using https://simplestatistics.org/docs/#bayesianclassifier
  // break stuff into 4 sets of words, then use BayesianClassifier to get estimates
  // Object.assign({}, ['a','b','c']); // {0:"a", 1:"b", 2:"c"}

  // https://www.npmjs.com/package/markdown-it-anchor
  // https://www.npmjs.com/package/markdown-it-emoji
  // https://www.npmjs.com/package/markdown-it-table-of-contents
  // https://www.npmjs.com/package/markdown-it-highlightjs
  // https://www.npmjs.com/package/markdown-it-external-links
  // https://www.npmjs.com/package/markdown-it-math or https://www.npmjs.com/package/markdown-it-mathjax
  const rawContent = request.body.article
  const content = md.render(rawContent)

  const post = await prisma.article.upsert({
    where: { displayId: request.fileId },
    update: {
      rawContent,
      content
    },
    create: {
      rawContent,
      content,
      author: {
        connect: { id }
      }
    }
  })

  reply.send(views.view(post))
})
