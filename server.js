#!/usr/bin/env node

// So the goal here is to just create a pastebin that you log into using Discord. When you log in, you're presented with all your files. You can edit or delete them.
// The real value is that when you paste the link to Discord it has a user created Embed, acting like a really good preview to the longer article
// People can just make index pages if they want to have collections

const server = require('server')
const { get, error } = server.router
const { status, render, redirect } = server.reply
const { modern } = server.utils

const es6Renderer = require('express-es6-template-engine')
const routes = require('auto-load')('routes')
const passport = require('passport')
const prisma = require('./prisma')

// need to make a Procfile that handles making the secret key and prisma shit

// https://github.com/jaredhanson/passport#sessions
passport.serializeUser(async function (user, done) {
  done(null, user.id)
})

passport.deserializeUser(async function (id, done) {
  const user = await prisma.user.findUnique({
    where: {
      id
    }
  })
  done(null, user)
})

// Run the server!
module.exports = server(
  {
    port: process.env.PORT || 0,
    views: 'views',
    favicon: './favicon.png',
    session: {
      secret: 'This is a super very long secret password',
      saveUninitialized: false,
      unset: 'destroy',
      cookie: { secure: false }
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
    }
  },
  modern(passport.initialize()),
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
    return status(500).send(`<pre>${ctx.error.message}</pre>`)
  })
)
