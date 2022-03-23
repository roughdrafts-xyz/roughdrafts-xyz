const { customAlphabet } = require('nanoid/async')
const nanoid = customAlphabet(
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  6
)
module.exports = nanoid
