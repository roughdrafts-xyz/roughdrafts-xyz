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
                <button>Back</button>
            </nav>
        </header>
        <article>
            <textarea disabled>
                ${data.rawContent}
            </textarea>
        </article>
    </body>
</html>`
