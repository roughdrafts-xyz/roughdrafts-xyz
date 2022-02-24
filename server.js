#!/usr/bin/env node

// So the goal here is to just create a pastebin that you log into using Discord. When you log in, you're presented with all your files. You can edit or delete them.
// The real value is that when you paste the link to Discord it has a user created Embed, acting like a really good preview to the longer article
// People can just make index pages if they want to have collections

const server = require('server')
const { get, post } = server.router
const { render } = server.reply
const es6Renderer = require('express-es6-template-engine')

const md = require('markdown-it')()
const { PrismaClient } = require('@prisma/client')
const { customAlphabet } = require('nanoid/async')
const nanoid = customAlphabet(
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  6
)

const prisma = new PrismaClient({ log: ['query'] })

// need to make a Procfile that handles making the secret key and prisma shit
// might be too technical for this? Asks a lot out of me. serverjs and kraken come with csrf and other guardrails by default

// Boring User Crap
// Users just oauth with Discord for now

get('/login', async (request, reply) => {
  // oauth2 bullshit
  // oauth does this redirect normally
  if (request.session.user) {
    reply.redirect(`/@${request.session.user.displayId}`)
  } else {
    reply.redirect('/login/callback')
  }
})

// this should be a post normally
// https://github.com/jaredhanson/passport-oauth2 This supports scope, its just not a documented option
get('/login/callback', async (request, reply) => {
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
  request.session.user = user
  if (isNew) {
    reply.redirect('/welcome')
  } else if (request.query.redirect) {
    reply.redirect(request.query.redirect)
  } else {
    reply.redirect(`/@${user.displayId}`)
  }
})

get('/logout', async (request, reply) => {
  if (request.session.user) {
    request.destroySession(err => {
      if (err) {
        reply.status(500)
        reply.redirect('/error')
      } else {
        reply.redirect('/')
      }
    })
  } else {
    reply.redirect('/')
  }
})

get('/settings', async (request, reply) => {
  const { id } = request.session.user
  if (!id) return null
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return null
  // Expose download link to personal sqlite db
  reply.send(views.userSettings(user))
})

post('/settings', async (request, reply) => {
  const { id } = request.session.user
  if (!id) return null
  const { displayId } = request.body
  const user = await prisma.user.update({ where: id, data: { displayId } })
  // do settings updates
  reply.send(views.userSettings(user))
})

get('/@:displayId', async (request, reply) => {
  console.log('displayId', request.params.displayId)
  const user = await prisma.user.findUnique({
    where: { displayId: request.params.displayId },
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
  reply.send(
    views.home({
      ...user,
      isUser: request.session?.user?.id === user.id
    })
  )
})

// File Stuff
get('/:fileId/raw', async (request, reply) => {
  const post = await prisma.article.findUnique({
    where: { displayId: request.fileId }
  })

  reply.send(views.viewRaw(post))
})
get('/:fileId/edit', async (request, reply) => {
  const { id } = request.session.user

  const post = await prisma.article.findUnique({
    where: { displayId: request.fileId }
  })

  if (id !== post.authorId) {
    reply.redirect(`/${request.fileId}/raw`)
  } else {
    // cache will be able to handle anything important here
    reply.send(views.edit({ post }))
  }
})

post('/:fileId/edit', async (request, reply) => {
  const { id } = request.session.user
  if (!id) return null

  // just write the new file to the database
  // do category and spam detection using https://simplestatistics.org/docs/#bayesianclassifier
  // break stuff into 4 sets of words, then use BayesianClassifier to get estimates
  // Object.assign({}, ['a','b','c']); // {0:"a", 1:"b", 2:"c"}

  // https://www.npmjs.com/package/markdown-it-anchor
  // https://www.npmjs.com/package/markdown-it-emoji
  // https://www.npmjs.com/package/markdown-it-table-of-contents
  // https://www.npmjs.com/package/markdown-it-highlightjs
  // https://www.npmjs.com/package/markdown-it-external-links
  // https://www.npmjs.com/package/markdown-it-math or https://www.npmjs.com/package/markdown-it-mathjax
  const rawContent = request.body.article
  const content = md.render(rawContent)

  const post = await prisma.article.upsert({
    where: { displayId: request.fileId },
    update: {
      rawContent,
      content
    },
    create: {
      rawContent,
      content,
      author: {
        connect: { id }
      }
    }
  })

  reply.send(views.view(post))
})

// Private or Public Post
// Title
// Eventually, RBAC stuff?
// Summary?
// Emoji?
// File or Editor type? (Markdown, Plaintext)
get('/:fileId/settings', async (request, reply) => {
  const { id } = request.session.user
  if (!id) return null

  const post = await prisma.article.findUnique({
    where: { displayId: request.fileId }
  })

  reply.send(views.articleSettings(post))
})

post('/:fileId/settings', async (request, reply) => {
  const { isPrivate } = request.body
  const post = await prisma.article.update({
    where: { displayId: request.fileId },
    data: {
      isPrivate
    }
  })
  reply.send(views.articleSettings(post))
})

get('/:fileId', async (request, reply) => {
  const post = await prisma.article.findUnique({
    where: { displayId: request.fileId }
  })

  reply.send(views.view(post))
  // do I need a dynamic get for header nonsense?
  // yup. This can probably still just be fast. Concat the header and the premade content or something.
  // oh, huh. nginx has caching thats easy enough to use. https://docs.nginx.com/nginx/admin-guide/content-cache/content-caching/
  // yeah, just save on the trouble of writing and just use views
  // let the cache handle stuff.
  // view thing was called point-of-view
  // lol I ended up just diy'ing my own views
})

// Run the server!
server(
  {
    port: 3000,
    views: 'views',
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
    log: 'debug'
  },
  [
    get('/', async (request, reply) => {
      if (false) {
        reply.redirect(`/@${request.session.user.displayId}`)
      } else {
        return render('login')
      }
    }),
    get('/welcome', ctx => render('registered'))
  ]
)
