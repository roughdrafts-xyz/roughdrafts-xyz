const { get } = require('server/router')
const { login, loginCallback, logout } = require('../handlers/login')

module.exports = [
  get('/login', login),
  get('/login/callback', loginCallback),
  get('/logout', logout)
]
