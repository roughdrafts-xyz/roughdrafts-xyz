const head = require('./head')
module.exports = data => /* html */ `
  <!DOCTYPE html>
  <html>
    <head>
        ${head}
    </head>
    <body>
      <header>
        <h2>Editing User Settings</h2>
        <nav>
          <button>Cancel</button>
        </nav>
      </header>
      <form action="/${data.title}/settings" method="post">
        <label>Display Name</label> <input type="text" name="displayId" value=${data.displayId}/>
        <button>Save</button>
      </form>
    </body>
  </html>`
