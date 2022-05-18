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

  const isUser = ctx.session?.user?.displayId === post.authorDisplayId

  if (!isUser) {
    if (post.visibility === 'private') return false
    return true
  } else {
    return false
  }
}

const shouldModify = (ctx, post) => {
  if (!post) return true

  const isUser = ctx.session?.user?.displayId === post.authorDisplayId

  if (isUser) return true
  return false
}

const getEmptyEditor = async ctx => {
  const post = await prisma.article.findUnique({
    where: {
      slugId: {
        authorDisplayId: ctx.params.authorDisplayId,
        displayId: ctx.params.displayId
      }
    }
  })

  if (!shouldDisplay(ctx, post)) throw new Error('Illegal Action')
  if (!post) {
    return render('edit', {
      authorDisplayId: ctx.params.authorDisplayId,
      displayId: ctx.params.displayId,
      title: 'New Article',
      rawContent: '',
      errorMessage: '',
      summary: '',
      visibility: 'unlisted',
      isNew: true
    })
  } else {
    return redirect(
      `/@${ctx.params.authorDisplayId}/${ctx.params.displayId}/edit`
    )
  }
}
const getEditor = async ctx => {
  const post = await prisma.article.findUnique({
    where: {
      slugId: {
        authorDisplayId: ctx.params.authorDisplayId,
        displayId: ctx.params.displayId
      }
    }
  })

  if (!post) {
    return redirect(
      `/@${ctx.params.authorDisplayId}/${ctx.params.displayId}/new`
    )
  }

  if (!shouldModify(ctx, post)) throw new Error('Illegal Action')
  // cache will be able to handle anything important here
  return render('edit', {
    ...post,
    errorMessage: '',
    isNew: false
  })
}

const updateArticle = async ctx => {
  const post = await prisma.article.findUnique({
    where: {
      slugId: {
        authorDisplayId: ctx.params.authorDisplayId,
        displayId: ctx.params.displayId
      }
    }
  })

  if (!shouldModify(ctx, post)) throw new Error('Illegal Action')
  // just write the new file to the database
  // do category and spam detection using https://simplestatistics.org/docs/#bayesianclassifier
  // break stuff into 4 sets of words, then use BayesianClassifier to get estimates
  // Object.assign({}, ['a','b','c']); // {0:"a", 1:"b", 2:"c"}

  const rawContent = ctx.body.article
  const content = md.render(rawContent)

  const { title, summary, displayId, visibility: rawVisibility } = ctx.body
  const visibility = ['public', 'unlisted', 'private'].includes(
    rawVisibility.toLowerCase()
  )
    ? rawVisibility.toLowerCase()
    : 'unlisted'

  const updateContent = {
    displayId,
    title,
    rawContent,
    content,
    summary,
    visibility
  }

  try {
    await prisma.article.upsert({
      where: {
        slugId: {
          authorDisplayId: ctx.params.authorDisplayId,
          displayId: ctx.params.displayId
        }
      },
      update: updateContent,
      create: {
        ...updateContent,
        authorDisplayId: ctx.params.authorDisplayId
      }
    })
  } catch (e) {
    console.error(e)
    let errorMessage
    if (e.meta.target.includes('displayId')) {
      errorMessage = /* html */ `<section role='alert'>The URL Endpoint "${displayId}" has already been taken.</section>`
    } else {
      errorMessage =
        "<section role='alert'>An unhandled error occured.</section>"
    }
    if (errorMessage) {
      const isNew = ctx.body.isNew === 'true'
      return render('edit', {
        ...updateContent,
        authorDisplayId: ctx.params.authorDisplayId,
        displayId: ctx.params.displayId,
        errorMessage,
        isNew
      })
    }
  }

  return redirect(`/@${ctx.params.authorDisplayId}/${ctx.body.displayId}`)
}

const deleteArticle = async ctx => {
  const post = await prisma.article.findUnique({
    where: {
      slugId: {
        authorDisplayId: ctx.params.authorDisplayId,
        displayId: ctx.params.displayId
      }
    }
  })

  if (!shouldModify(ctx, post)) throw new Error('Illegal Action')
  if (ctx.body.deleteMe !== post.displayId) throw new Error('Illegal Action')
  await prisma.article.delete({
    where: {
      slugId: {
        authorDisplayId: ctx.params.authorDisplayId,
        displayId: ctx.params.displayId
      }
    }
  })
  return redirect('/')
}

module.exports = {
  // File Stuff
  getEditor,
  getEmptyEditor,
  updateArticle,
  deleteArticle
}
