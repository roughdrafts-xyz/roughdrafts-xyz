const extractTags = rawContent =>
  rawContent
    .split(' ')
    .filter(o => o.startsWith('#'))
    .map(o => o.slice(1))

const doTagsHack = ctx =>
  ctx.body.thought
    .split(' ')
    .map(o => {
      if (o.startsWith('#')) {
        return `[${o}](/@${
          ctx.params.authorDisplayId
        }/thoughts/tagged/${o.slice(1)})`
      }
      return o
    })
    .join(' ')

module.exports = {
  extractTags,
  doTagsHack
}
