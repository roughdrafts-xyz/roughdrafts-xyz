const head = require('./head')
module.exports = data => /* html */ `
  <!DOCTYPE html>
  <html>
    <head>
        ${head}
    </head>
    <body>
      <header>
        <h2>Editing Settings for ${data.title}</h2>
        <nav>
          <button>Edit</button>
          <button>Cancel</button>
        </nav>
      </header>
      <form action="/${data.title}/settings" method="post">
        <label>Private?</label> <input type="checkbox" name="private" value=${data.private}/>
        <button>Save</button>
      </form>
    </body>
  </html>`
