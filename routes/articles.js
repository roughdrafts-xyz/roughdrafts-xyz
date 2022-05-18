const { get, post } = require('server/router')
const handlers = require('auto-load')('handlers/articles')

module.exports = [
  get('/@:authorDisplayId/:displayId', handlers.view.viewFile),
  get('/@:authorDisplayId/:displayId/new', handlers.edit.getEmptyEditor),
  get('/@:authorDisplayId/:displayId/edit', handlers.edit.getEditor),
  post('/@:authorDisplayId/:displayId/edit', handlers.edit.updateArticle),
  post('/@:authorDisplayId/:displayId/delete', handlers.edit.deleteArticle)
]
