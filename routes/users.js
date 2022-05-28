const { get, post } = require('server/router')
const handlers = require('auto-load')('handlers/users')

module.exports = [
  get('/@:displayId', handlers.view.viewUser),
  get('/@:displayId/thoughts/tagged/:tag', handlers.thoughts.viewByTag),
  get('/@:authorDisplayId/thoughts/:displayId', handlers.thoughts.viewById),
  get('/@:displayId/thoughts/:thoughDisplayId/edit', handlers.thoughts.edit),
  get('/@:displayId/thoughts', handlers.dashboard.viewDashboard),
  post('/@:displayId/thoughts', handlers.dashboard.addThought),
  get('/@:displayId/:displayId_notes.zip', handlers.view.downloadArticles),
  post('/@:displayId/delete', handlers.settings.deleteUser),
  get('/settings', handlers.settings.viewSettings),
  post('/settings', handlers.settings.updateSettings)
]
