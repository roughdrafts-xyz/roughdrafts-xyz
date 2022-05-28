const { render, redirect } = require('server/reply')
const prisma = require('../../prisma')
const { extractTags, doTagsHack } = require('./tagsHacks')
const md = require('markdown-it')()
  .use(require('markdown-it-emoji'))
  .use(require('markdown-it-highlightjs'))
  .use(require('markdown-it-external-links'))
  .disable(['heading', 'lheading'])

const shouldAccess = (ctx, thought) => {
  if (!thought) return true

  return ctx.session?.user?.displayId === thought.authorDisplayId
}

const viewById = async ctx => {
  const thought = await prisma.thought.findUnique({
    where: {
      slugId: {
        authorDisplayId: ctx.params.authorDisplayId,
        displayId: ctx.params.displayId
      }
    }
  })

  if (!shouldAccess(ctx, thought)) throw new Error('Illegal Action')

  return render('thoughts/view', thought)
}

const viewByTag = async ctx => {}

const getThoughtEditor = async ctx => {
  const thought = await prisma.thought.findUnique({
    where: {
      slugId: {
        authorDisplayId: ctx.params.authorDisplayId,
        displayId: ctx.params.displayId
      }
    }
  })

  const isInline = ctx.query.isInline === 'true' ? '?isInline=true' : ''

  console.log('isInline', isInline)
  if (!shouldAccess(ctx, thought)) throw new Error('Illegal Action')
  return render('thoughts/edit', {
    ...thought,
    isInline
  })
}

const updateThought = async ctx => {
  const thought = await prisma.thought.findUnique({
    where: {
      slugId: {
        authorDisplayId: ctx.params.authorDisplayId,
        displayId: ctx.params.displayId
      }
    }
  })

  if (!shouldAccess(ctx, thought)) throw new Error('Illegal Action')

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
    return redirect(`/@${ctx.params.authorDisplayId}/thoughts`)
  } else {
    return redirect(
      `/@${ctx.params.authorDisplayId}/thoughts/${ctx.params.displayId}`
    )
  }
}

module.exports = {
  getThoughtEditor,
  updateThought,
  viewById,
  viewByTag
}
