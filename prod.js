const server = require('./server')

server.then(app => {
  app.app.enable('trust proxy')
  console.log('Server launched successfully')
})
