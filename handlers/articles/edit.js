const { render, redirect } = require('server/reply')
const prisma = require('../../prisma')
const anchor = require('markdown-it-anchor')
const md = require('markdown-it')()
  .use(anchor, {
    permalink: anchor.permalink.headerLink()
  })
  .use(require('markdown-it-emoji'))
  .use(require('markdown-it-toc-done-right'))
  .use(require('markdown-it-highlightjs'))
  .use(require('markdown-it-external-links'))

const shouldDisplay = (ctx, post) => {
  if (!post) return true

  const isUser = ctx.session?.user?.id === post.authorId

  if (!isUser) {
    if (post.visibility === 'private') return false
    return true
  } else {
    return false
  }
}

const shouldModify = (ctx, post) => {
  if (!post) return true

  const isUser = ctx.session?.user?.id === post.authorId

  if (isUser) return true
  return false
}

const getRaw = async ctx => {
  const post = await prisma.article.findUnique({
    where: { displayId: ctx.params.displayId }
  })

  if (!shouldDisplay(ctx, post)) return null
  return render('viewRaw', post)
}

const getEmptyEditor = async ctx => {
  const post = await prisma.article.findUnique({
    where: { displayId: ctx.params.displayId }
  })

  if (!shouldDisplay(ctx, post)) return null
  if (!post) {
    return render('new', {
      displayId: ctx.params.displayId,
      title: 'New Article',
      rawContent: ''
    })
  } else {
    return redirect(`/${ctx.params.displayId}/edit`)
  }
}
const getEditor = async ctx => {
  const { id } = ctx.session.user

  const post = await prisma.article.findUnique({
    where: { displayId: ctx.params.displayId }
  })

  if (!post) {
    return redirect(`${ctx.params.displayId}/new`)
  }

  if (!shouldModify(ctx, post)) return null

  if (id !== post.authorId) {
    return redirect(`/${ctx.params.fileId}/raw`)
  } else {
    // cache will be able to handle anything important here
    return render('edit', post)
  }
}

const updateArticle = async ctx => {
  const { id } = ctx.session.user
  if (!id) return null

  const post = await prisma.article.findUnique({
    where: { displayId: ctx.params.displayId }
  })

  if (!shouldModify(ctx, post)) return null
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
  const rawContent = ctx.body.article
  const content = md.render(rawContent)

  await prisma.article.upsert({
    where: { displayId: ctx.params.displayId },
    update: {
      rawContent,
      content
    },
    create: {
      displayId: ctx.params.displayId,
      title: ctx.body.title,
      rawContent,
      content,
      summary: '',
      author: {
        connect: { id }
      }
    }
  })

  return redirect(`/${ctx.params.displayId}`)
}

const deleteArticle = async ctx => {
  const { id } = ctx.session.user
  if (!id) return null

  const post = await prisma.article.findUnique({
    where: { displayId: ctx.params.displayId }
  })

  if (!shouldModify(ctx, post)) return null
  if (ctx.body.deleteMe !== post.displayId) return null
  await prisma.article.delete({ where: { displayId: ctx.params.displayId } })
  return redirect('/')
}

module.exports = {
  // File Stuff
  getRaw,
  getEditor,
  getEmptyEditor,
  updateArticle,
  deleteArticle
}
