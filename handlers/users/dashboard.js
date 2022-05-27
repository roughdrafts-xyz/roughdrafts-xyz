const { render, redirect } = require('server/reply')
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

const extractTags = rawContent =>
  rawContent
    .split(' ')
    .filter(o => o.startsWith('#'))
    .map(o => o.slice(1))

const doTagsHack = rawContent =>
  rawContent
    .split(' ')
    .map(o => {
      if (o.startsWith('#')) {
        return `[${o}](/${o})`
      }
      return o
    })
    .join(' ')

const addThought = async ctx => {
  const rawContent = ctx.body.thought
  const tags = extractTags(rawContent).map(curr => ({ displayId: curr }))
  const tagHackedContent = doTagsHack(rawContent)
  const content = md.render(tagHackedContent)

  await prisma.thought.create({
    data: {
      content,
      rawContent,
      authorDisplayId: ctx.params.displayId,
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
