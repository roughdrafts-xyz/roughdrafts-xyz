const { get } = require('server/router')
const { loginCallback, logout } = require('../handlers/login')

module.exports = [get('/login/callback', loginCallback), get('/logout', logout)]
