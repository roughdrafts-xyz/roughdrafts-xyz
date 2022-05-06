#!/usr/bin/env node

// So the goal here is to just create a pastebin that you log into using Discord. When you log in, you're presented with all your files. You can edit or delete them.
// The real value is that when you paste the link to Discord it has a user created Embed, acting like a really good preview to the longer article
// People can just make index pages if they want to have collections

const server = require('server')
const { get, error } = server.router
const { render, redirect } = server.reply
const { modern } = server.utils

const es6Renderer = require('express-es6-template-engine')
const routes = require('auto-load')('routes')
const grant = require('grant').express()

// need to make a Procfile that handles making the secret key and prisma shit

// Run the server!
module.exports = server(
  {
    port: process.env.PORT || 0,
    views: 'views',
    favicon: './favicon.png',
    session: {
      secret: process.env.RD_SECRET,
      saveUninitialized: false,
      unset: 'destroy',
      cookie: { secure: true }
    },
    engine: {
      html: (file, options, cb) =>
        es6Renderer(
          file,
          {
            locals: options,
            partials: { head: './partials/head.html' }
          },
          cb
        )
    },
    log: {
      level: 'info',
      report: (content, type) => {
        console.log(content)
      }
    }
  },
  modern(
    grant({
      defaults: {
        origin: process.env.GRANT_ORIGIN,
        transport: 'session',
        state: true
      },
      discord: {
        key: process.env.DISCORD_KEY,
        secret: process.env.DISCORD_SECRET,
        callback: '/login/callback',
        scope: ['identify']
      }
    })
  ),
  [
    get('/', async ctx => {
      if (ctx.session.user) {
        return redirect(`/@${ctx.session.user.displayId}`)
      } else {
        return render('login')
      }
    }),
    get('/welcome', async ctx => render('registered'))
  ],
  ...routes.login,
  ...routes.users,
  ...routes.articles,
  error(ctx => {
    console.error(ctx.error.message)
    return render('error')
  })
)
