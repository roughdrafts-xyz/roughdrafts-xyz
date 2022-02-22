const head = require('./head')
module.exports = data => /* html */ `
  <!DOCTYPE html>
  <html>
    <head>
        ${head}
    </head>
    <body>
      <header>
        <h1>Rought Drafts</h2>
      </header>
      <a href="/login"><button>Connect with Discord</button></a>
    </body>
  </html>`
