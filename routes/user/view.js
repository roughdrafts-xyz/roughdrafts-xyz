const { get } = require('server/router')
const { render } = require('server/reply')
const prisma = require('../../prisma')

module.exports = [
  get('/@:displayId', async ctx => {
    const user = await prisma.user.findUnique({
      where: { displayId: ctx.params.displayId },
      include: { articles: true, profile: true }
    })

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
    return render('home', {
      ...user,
      isUser: ctx.session?.user?.id === user.id
    })
  })
]
