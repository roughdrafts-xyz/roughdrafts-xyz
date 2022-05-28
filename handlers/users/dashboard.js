const { render, redirect } = require('server/reply')
const { extractTags, doTagsHack } = require('./tagsHacks')
const prisma = require('../../prisma')
const nanoid = require('../../nanoid')
const md = require('markdown-it')()
  .use(require('markdown-it-emoji'))
  .use(require('markdown-it-highlightjs'))
  .use(require('markdown-it-external-links'))
  .disable(['heading', 'lheading'])

const viewDashboard = async ctx => {
  const user = await prisma.user.findUnique({
    where: { displayId: ctx.params.displayId },
    include: {
      thoughts: {
        orderBy: {
          updatedAt: 'desc'
        }
      }
    }
  })
  const newArticleId = await nanoid()

  return render('dashboard', {
    ...user,
    newArticleId
  })
}

const addThought = async ctx => {
  const rawContent = ctx.body.thought
  const tags = extractTags(rawContent).map(curr => ({ displayId: curr }))
  const tagHackedContent = doTagsHack(ctx)
  const content = md.render(tagHackedContent)
  const displayId = await nanoid()

  await prisma.thought.create({
    data: {
      content,
      rawContent,
      displayId,
      authorDisplayId: ctx.params.authorDisplayId,
      tags: {
        create: tags
      }
    }
  })

  return redirect(`/@${ctx.params.displayId}/thoughts`)
}

module.exports = {
  addThought,
  viewDashboard
}
