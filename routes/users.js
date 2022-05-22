const { get, post } = require('server/router')
const handlers = require('auto-load')('handlers/users')

module.exports = [
  get('/@:displayId', handlers.view.viewUser),
  get('/@:displayId/thoughts', handlers.dashboard.viewDashboard),
  post('/@:displayId/thoughts', handlers.dashboard.addThought),
  get('/@:displayId/:displayId_notes.zip', handlers.view.downloadArticles),
  post('/@:displayId/delete', handlers.settings.deleteUser),
  get('/settings', handlers.settings.viewSettings),
  post('/settings', handlers.settings.updateSettings)
]
