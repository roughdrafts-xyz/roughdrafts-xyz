const { redirect } = require('server/reply')
const prisma = require('../../prisma')
const nanoid = require('../../nanoid')
const axios = require('axios')

const loginCallback = async ctx => {
  const discordToken = ctx.session.grant.response.access_token
  const discordAPI = 'https://discord.com/api/users/@me'
  if (!discordToken) {
    return redirect(500, '/error')
  }
  const { data: discordResults } = await axios.get(discordAPI, {
    headers: { Authorization: `Bearer ${discordToken}` }
  })
  const discordId = discordResults.id
  const discordName = discordResults.username
  let user = await prisma.user.findUnique({ where: { discordId } })
  if (!user) {
    user = await prisma.user.create({
      data: {
        discordId,
        displayId: await nanoid(),
        name: discordName
      }
    })
  }

  ctx.session.user = user
  delete ctx.session.grant

  if (ctx.query.redirect) {
    return redirect(303, ctx.query.redirect)
  } else {
    return redirect(303, `/@${user.displayId}`)
  }
}

const logout = async ctx => {
  if (ctx.session.user) {
    ctx.session.destroy(null)
  }
  return redirect(303, '/')
}
module.exports = {
  loginCallback,
  logout
}
