const server = require('./server')

server.then(app => {
  console.log(
    `Server launched on http://localhost:${app.server.address().port}/`
  )
})
