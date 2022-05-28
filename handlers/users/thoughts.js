const { render, redirect } = require('server/reply')
const prisma = require('../../prisma')
const { extractTags, doTagsHack } = require('./tagsHacks')
const md = require('markdown-it')()
  .use(require('markdown-it-emoji'))
  .use(require('markdown-it-highlightjs'))
  .use(require('markdown-it-external-links'))
  .disable(['heading', 'lheading'])

const shouldDisplay = (ctx, thought) => {
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

  if (!shouldDisplay(ctx, thought)) throw new Error('Illegal Action')
  console.log(thought)

  return render('thoughts/view', thought)
}

const viewByTag = async ctx => {}

const edit = async ctx => {
  const rawContent = ctx.body.thought
  const tags = extractTags(rawContent).map(curr => ({ displayId: curr }))
  const tagHackedContent = doTagsHack(ctx)
  const content = md.render(tagHackedContent)

  await prisma.thought.create({
    data: {
      content,
      rawContent,
      displayId,
      authorDisplayId: ctx.params.displayId,
      tags: {
        create: tags
      }
    }
  })

  return redirect(`/@${ctx.params.displayId}/thoughts`)
}

module.exports = {
  edit,
  viewById,
  viewByTag
}
