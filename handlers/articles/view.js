const { render } = require('server/reply')
const prisma = require('../../prisma')

const viewFile = async ctx => {
  const post = await prisma.article.findUnique({
    where: {
      slugId: {
        authorDisplayId: ctx.params.authorDisplayId,
        displayId: ctx.params.displayId
      }
    },
    include: {
      author: true
    }
  })
  const isUser = ctx.session?.user?.id === post.author.id

  if (!isUser) {
    if (post.visibility === 'private') throw new Error('Illegal Action')
  }

  return render('view', {
    ...post,
    isUser,
    ogUrl: `${process.env.GRANT_ORIGIN}${ctx.url}`
  })
  // do I need a dynamic get for header nonsense?
  // yup. This can probably still just be fast. Concat the header and the premade content or something.
  // oh, huh. nginx has caching thats easy enough to use. https://docs.nginx.com/nginx/admin-guide/content-cache/content-caching/
  // yeah, just save on the trouble of writing and just use views
  // let the cache handle stuff.
  // view thing was called point-of-view
  // lol I ended up just diy'ing my own views
}
module.exports = {
  viewFile
}
