const head = require('./head')
module.exports = data => /* html */ `
  <!DOCTYPE html>
  <html>
    <head>
        ${head}
    </head>
    <body>
      <header>
        <h1>Welcome to Rough Drafts</h2>
      </header>
      <article>
      <section>
      <header>
        <h2>What to do now.</h2>
      </header>
      <dl>
      <dt><button>Create an Article</button></dt>
      <dd>Write something down and share it with others.</dd>
      <dt><button>Change your Settings</button></dt>
      <dd>Customize your account name</dd>
      <dd>Summarize yourself</dd>
      <dd>Delete your account</dd>
      <dd>Log out</dd>
      </dl>
      </p>
      </article>
    </body>
  </html>`
