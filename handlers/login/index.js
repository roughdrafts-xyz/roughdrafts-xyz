const { redirect } = require('server/reply')
const prisma = require('../../prisma')
const nanoid = require('../../nanoid')

const login = async ctx => {
  // oauth2 bullshit
  // oauth does this redirect normally
  if (ctx.session.user) {
    return redirect(303, `/@${ctx.session.user.displayId}`)
  } else {
    return redirect(303, '/login/callback')
  }
}

const loginCallback = async ctx => {
  // this should be a post normally
  // https://github.com/jaredhanson/passport-oauth2 This supports scope, its just not a documented option

  // idk discord is probably going to want this tho
  const discordId = '1235'
  const discordName = 'Sum Guy'
  let user = await prisma.user.findUnique({ where: { discordId } })
  let isNew = false
  if (!user) {
    user = await prisma.user.create({
      data: {
        discordId,
        displayId: await nanoid(),
        name: discordName
      }
    })
    isNew = true
  }
  // ah shit we need cookies or something
  ctx.session.user = user
  if (isNew) {
    return redirect(303, '/welcome')
  } else if (ctx.query.redirect) {
    return redirect(303, ctx.query.redirect)
  } else {
    return redirect(303, `/@${user.displayId}`)
  }
}

const logout = async ctx => {
  if (ctx.session.user) {
    ctx.session.destroy(err => {
      if (err) {
        return redirect(500, '/error')
      } else {
        return redirect(303, '/')
      }
    })
  } else {
    return redirect(303, '/')
  }
}
module.exports = {
  login,
  loginCallback,
  logout
}
