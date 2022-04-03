const { render } = require('server/reply')
const prisma = require('../../prisma')
const nanoid = require('../../nanoid')

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

module.exports = {
  viewUser
}
