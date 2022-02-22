const head = require('./head')
module.exports = data => /* html */ `
  <!DOCTYPE html>
  <html>
    <head>
        ${head}
      <link rel="stylesheet" href="https://unpkg.com/easymde/dist/easymde.min.css" />
      <script src="https://unpkg.com/easymde/dist/easymde.min.js"></script>
      <style>
        form {
          display: flex;
          flex-direction: column;
        }
        header {
          display: flex;
          justify-content: space-between;
        }
        .editor-toolbar button {
          color: initial;
        }
      </style>
    </head>
    <body>
      <header>
        <h2>Editing ${data.title}</h2>
        <nav>
          <button>Settings</button>
          <button>Cancel</button>
        </nav>
      </header>
      <form action="/${data.title}/edit" method="post">
        <textarea name="article">${data.rawContent}</textarea>
        <button>Save</button>
      </form>
    </body>
    <script>
      const easyMDE = new EasyMDE({
        autofocus: true,
        autosave:{
          enabled: true,
          uniqueId: ${data.id},
          text: 'Last saved locally at '
        }
      })
    </script>
  </html>`
