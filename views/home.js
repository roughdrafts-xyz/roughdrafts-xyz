const head = require('./head')
module.exports = data => {
  const articles = data.articles
    .map(
      curr => /* html */ `<section>
            <h3><a href="#">${curr.title}</a></h3>
            <span>${curr.summary}</span><br/>
            <small>${curr.tags}</small>
        </section>`
    )
    .join('')

  return /* html */ `<!DOCTYPE html>
<html>
    <head>
        ${head}
    </head>
    <body>
        <header>
            <h2>${data.profile.name}</h2>
            <p>${data.profile.summary}</p>
        </header>
        ${articles}
    </body>
</html>`
}
