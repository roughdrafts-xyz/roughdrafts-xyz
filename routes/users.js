const { get, post } = require('server/router')
const handlers = require('auto-load')('handlers/users')

module.exports = [
  get('/@:displayId', handlers.view.viewUser),
  get('/@:authorDisplayId/thoughts/tagged/:tag', handlers.thoughts.viewByTag),
  get('/@:authorDisplayId/thoughts/:displayId', handlers.thoughts.viewById),
  get(
    '/@:authorDisplayId/thoughts/:displayId/edit',
    handlers.thoughts.getThoughtEditor
  ),
  post(
    '/@:authorDisplayId/thoughts/:displayId/edit',
    handlers.thoughts.updateThought
  ),
  get('/@:displayId/thoughts', handlers.dashboard.viewDashboard),
  post('/@:authorDisplayId/thoughts', handlers.dashboard.addThought),
  get('/@:displayId/:displayId_notes.zip', handlers.view.downloadArticles),
  post('/@:displayId/delete', handlers.settings.deleteUser),
  get('/settings', handlers.settings.viewSettings),
  post('/settings', handlers.settings.updateSettings)
]
