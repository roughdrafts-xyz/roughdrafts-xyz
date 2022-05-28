const { render, redirect } = require('server/reply')
const prisma = require('../../prisma')
const { extractTags, doTagsHack } = require('./tagsHacks')
const md = require('markdown-it')()
  .use(require('markdown-it-emoji'))
  .use(require('markdown-it-highlightjs'))
  .use(require('markdown-it-external-links'))
  .disable(['heading', 'lheading'])

const shouldAccess = (ctx, thought) => {
  return ctx.session?.user?.displayId === ctx.params.authorDisplayId
}

const viewById = async ctx => {
  if (!shouldAccess(ctx)) throw new Error('Illegal Action')

  const thought = await prisma.thought.findUnique({
    where: {
      slugId: {
        authorDisplayId: ctx.params.authorDisplayId,
        displayId: ctx.params.displayId
      }
    }
  })

  const tagParams = ctx.query.tags

  return render('thoughts/view', {
    ...thought,
    tagParams
  })
}

const viewByTag = async ctx => {
  if (!shouldAccess(ctx)) throw new Error('Illegal Action')
  const tags = ctx.params.tags.split(',').map(o => o.trim())

  const thoughts = await prisma.thought.findMany({
    where: {
      authorDisplayId: ctx.params.authorDisplayId,
      tags: {
        some: {
          displayId: {
            in: tags
          }
        }
      }
    }
  })

  return render('thoughts/list', {
    thoughts,
    tagParams: ctx.params.tags
  })
}

const getThoughtEditor = async ctx => {
  if (!shouldAccess(ctx)) throw new Error('Illegal Action')
  const thought = await prisma.thought.findUnique({
    where: {
      slugId: {
        authorDisplayId: ctx.params.authorDisplayId,
        displayId: ctx.params.displayId
      }
    }
  })

  const queryLine = [
    ctx.query.isInline === 'true' ? 'isInline=true' : null,
    ctx.query.tags ? `tags=${ctx.query.tags}` : null
  ]
    .filter(o => o)
    .join('&')

  return render('thoughts/edit', {
    ...thought,
    queryLine: queryLine ? `?${queryLine}` : ''
  })
}

const updateThought = async ctx => {
  if (!shouldAccess(ctx)) throw new Error('Illegal Action')

  const rawContent = ctx.body.thought
  const tags = extractTags(rawContent).map(curr => ({ displayId: curr }))
  const tagHackedContent = doTagsHack(ctx)
  const content = md.render(tagHackedContent)
  const { displayId, authorDisplayId } = ctx.params

  await prisma.thought.update({
    where: {
      slugId: {
        authorDisplayId,
        displayId
      }
    },
    data: {
      content,
      rawContent,
      tags: {
        create: tags
      }
    }
  })

  if (ctx.query.isInline === 'true') {
    if (ctx.query.tags) {
      return redirect(
        `/@${ctx.params.authorDisplayId}/thoughts/tagged/${ctx.query.tags}`
      )
    } else {
      return redirect(`/@${ctx.params.authorDisplayId}/thoughts`)
    }
  } else {
    if (ctx.query.tags) {
      return redirect(
        `/@${ctx.params.authorDisplayId}/thoughts/${ctx.params.displayId}?tags=${ctx.query.tags}`
      )
    } else {
      return redirect(
        `/@${ctx.params.authorDisplayId}/thoughts/${ctx.params.displayId}`
      )
    }
  }
}

module.exports = {
  getThoughtEditor,
  updateThought,
  viewById,
  viewByTag
}
