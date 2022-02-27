const { redirect } = require('server/reply')
const prisma = require('../../prisma')
const { customAlphabet } = require('nanoid/async')
const nanoid = customAlphabet(
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  6
)

const login = async ctx => {
  // oauth2 bullshit
  // oauth does this redirect normally
  if (ctx.session.user) {
    return redirect(`/@${ctx.session.user.displayId}`)
  } else {
    return redirect('/login/callback')
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
        profile: {
          create: {
            name: discordName
          }
        }
      }
    })
    isNew = true
  }
  // ah shit we need cookies or something
  ctx.session.user = user
  if (isNew) {
    return redirect('/welcome')
  } else if (ctx.query.redirect) {
    return redirect(ctx.query.redirect)
  } else {
    return redirect(`/@${user.displayId}`)
  }
}

const logout = async ctx => {
  if (ctx.session.user) {
    ctx.session.destroy(err => {
      if (err) {
        return redirect(500, '/error')
      } else {
        return redirect('/')
      }
    })
  } else {
    return redirect('/')
  }
}
module.exports = {
  login,
  loginCallback,
  logout
}
