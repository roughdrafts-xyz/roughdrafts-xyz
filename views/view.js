const head = require('./head')
module.exports = data => /* html */ `<!DOCTYPE html>
<html>
    <head>
        ${head}
        <style>
header{
    display: flex;
    justify-content: space-between;
}
        </style>
    </head>
    <body>
        <header>
            <h2>${data.title}</h2>
            <nav>
                <button>Settings</button>
                <button>Edit</button>
            </nav>
        </header>
        <article>
            ${data.article}
        </article>
    </body>
</html>`
