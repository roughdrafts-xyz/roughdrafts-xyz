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

const getEmptyEditor = async ctx => {
  const post = await prisma.article.findUnique({
    where: { displayId: ctx.params.displayId }
  })

  if (!shouldDisplay(ctx, post)) throw new Error('Illegal Action')
  if (!post) {
    return render('edit', {
      displayId: ctx.params.displayId,
      title: 'New Article',
      rawContent: '',
      errorMessage: '',
      summary: '',
      visibility: 'unlisted',
      isNew: true
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

  if (!shouldModify(ctx, post)) throw new Error('Illegal Action')

  if (id !== post.authorId) {
    throw new Error('Illegal Action')
  } else {
    // cache will be able to handle anything important here
    return render('edit', {
      ...post,
      errorMessage: '',
      isNew: false
    })
  }
}

const updateSettings = async ctx => {
  const { id } = ctx.session.user
  if (!id) throw new Error('Illegal Action')

  const { title, summary, displayId, visibility: rawVisibility } = ctx.body
  const post = await prisma.article.findUnique({
    where: { displayId: ctx.params.displayId }
  })

  if (id !== post.authorId) {
    throw new Error('Illegal Action')
  }

  const visibility = ['public', 'unlisted', 'private'].includes(
    rawVisibility.toLowerCase()
  )
    ? rawVisibility.toLowerCase()
    : 'unlisted'

  try {
    await prisma.article.update({
      where: { displayId: ctx.params.displayId },
      data: {
        title,
        summary,
        displayId,
        visibility
      }
    })
  } catch (e) {
    console.error(e)
    if (e.meta.target.includes('displayId')) {
      return /* html */ `<section role='alert'>The URL Endpoint "${displayId}" has already been taken.</section>`
    } else {
      return "<section role='alert'>An unhandled error occured.</section>"
    }
  }
}

const updateArticle = async ctx => {
  const { id } = ctx.session.user
  if (!id) throw new Error('Illegal Action')

  const post = await prisma.article.findUnique({
    where: { displayId: ctx.params.displayId }
  })

  if (!shouldModify(ctx, post)) throw new Error('Illegal Action')
  // just write the new file to the database
  // do category and spam detection using https://simplestatistics.org/docs/#bayesianclassifier
  // break stuff into 4 sets of words, then use BayesianClassifier to get estimates
  // Object.assign({}, ['a','b','c']); // {0:"a", 1:"b", 2:"c"}

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

  const errorMessage = await updateSettings(ctx)
  if (errorMessage) {
    return render('edit', {
      ...post,
      errorMessage,
      isNew: true
    })
  }

  return redirect(`/${ctx.body.displayId}`)
}

const deleteArticle = async ctx => {
  const { id } = ctx.session.user
  if (!id) throw new Error('Illegal Action')

  const post = await prisma.article.findUnique({
    where: { displayId: ctx.params.displayId }
  })

  if (!shouldModify(ctx, post)) throw new Error('Illegal Action')
  if (ctx.body.deleteMe !== post.displayId) throw new Error('Illegal Action')
  await prisma.article.delete({ where: { displayId: ctx.params.displayId } })
  return redirect('/')
}

module.exports = {
  // File Stuff
  getEditor,
  getEmptyEditor,
  updateArticle,
  deleteArticle
}
