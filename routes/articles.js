const { get, post } = require('server/router')
const handlers = require('auto-load')('handlers/articles')

module.exports = [
  get('/:fileId', handlers.view.viewFile),
  get('/:fileId/settings', handlers.settings.getSettings),
  post('/:fileId/settings', handlers.settings.updateSettings),
  get('/:fileId/raw', handlers.edit.getRaw),
  get('/:fileId/edit', handlers.edit.getEditor),
  post('/:fileId/edit', handlers.edit.updateArticle)
]
