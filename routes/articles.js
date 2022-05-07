const { get, post } = require('server/router')
const handlers = require('auto-load')('handlers/articles')

module.exports = [
  get('/:displayId', handlers.view.viewFile),
  get('/:displayId/new', handlers.edit.getEmptyEditor),
  get('/:displayId/edit', handlers.edit.getEditor),
  post('/:displayId/edit', handlers.edit.updateArticle),
  post('/:displayId/delete', handlers.edit.deleteArticle)
]
