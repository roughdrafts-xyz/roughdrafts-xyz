const { render, status, header, send } = require('server/reply')
const prisma = require('../../prisma')
const nanoid = require('../../nanoid')
const JSZip = require('jszip')

const viewUser = async ctx => {
  const user = await prisma.user.findUnique({
    where: { displayId: ctx.params.displayId }
  })
  const isUser = ctx.session?.user?.id === user.id
  // TODO see if theres a way to not do this, it might be a memory leak source.

  if (isUser) {
    const privateUser = await prisma.user.findUnique({
      where: { displayId: ctx.params.displayId },
      include: { articles: true }
    })
    const newArticleId = await nanoid()
    return render('home', {
      ...privateUser,
      isUser,
      newArticleId
    })
  } else {
    const publicUser = await prisma.user.findUnique({
      where: { displayId: ctx.params.displayId },
      include: { articles: { where: { visibility: 'public' } } }
    })
    return render('home', {
      ...publicUser,
      isUser
    })
  }

  // pagination
  // https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination

  // List of stuff they've made thats public to view?
  // or just be a dashboard
  /*
      username: 'Test User',
      summary:
        'Two thousand or so words to test out the summary of this fake user.',
      articles: [
        {
          title: '🍎 Apple',
          summary: 'Delicious red thing',
          tags: '#red #apple #fruit'
        }
      ]
  */
}

const downloadArticles = async ctx => {
  const { id } = ctx.session.user
  if (!id) return null
  const posts = await prisma.article.findMany({ where: { authorId: id } })
  if (!posts) return null
  const zip = new JSZip()
  const markdown = zip.folder('markdown')
  const html = zip.folder('html')
  posts.forEach(post => {
    const markdownContents = [
      '---',
      `title: ${post.title}`,
      `summary: ${post.summary}`,
      `createdAt: ${post.createdAt}`,
      `updatedAt: ${post.updatedAt}`,
      '---',
      '',
      `${post.rawContent}`
    ].join('\n')

    const htmlContents = [
      '<!DOCTYPE html>',
      '<html>',
      '<head>',
      `<title>${post.title}</title>`,
      `<meta name="description" content="${post.summary}"/>`,
      `<meta name="createdAt" content="${post.createdAt}"/>`,
      `<meta name="updatedAt" content="${post.updatedAt}"/>`,
      '</head>',
      '<body>',
      `${post.content}`,
      '</body>',
      '</html>'
    ].join('\n')

    markdown.file(`${post.displayId}.md`, markdownContents)
    html.file(`${post.displayId}.html`, htmlContents)
  })
  const base64 = await zip.generateAsync({ type: 'base64' })
  const zipBuffer = Buffer.from(base64, 'base64')
  return status(200)
    .header({
      'Content-Type': 'application/zip',
      'Content-disposition': `attachment; filename=${ctx.session.user.displayId}_notes.zip`
    })
    .send(zipBuffer)
}

module.exports = {
  viewUser,
  downloadArticles
}
