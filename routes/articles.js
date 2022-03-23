const { get, post } = require('server/router')
const handlers = require('auto-load')('handlers/articles')

module.exports = [
  get('/:displayId', handlers.view.viewFile),
  get('/:displayId/settings', handlers.settings.getSettings),
  post('/:displayId/settings', handlers.settings.updateSettings),
  get('/:displayId/raw', handlers.edit.getRaw),
  get('/:displayId/new', handlers.edit.getEmptyEditor),
  get('/:displayId/edit', handlers.edit.getEditor),
  post('/:displayId/edit', handlers.edit.updateArticle)
]
