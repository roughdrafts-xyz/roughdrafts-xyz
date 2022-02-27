const { get, post } = require('server/router')
const handlers = require('auto-load')('handlers/users')

module.exports = [
  get('/@:displayId', handlers.view.viewUser),
  get('/settings', handlers.settings.viewSettings),
  post('/settings', handlers.settings.updateSettings)
]
