# Draft for a template literal engine

This is for express, server has its [own syntax](https://serverjs.io/documentation/options/#writing-your-own-engine)

```js
app.engine("js", (filePath, options, callback) => {
  //This should just load up the view function and pass it stuff
  const view = require(filePath);
  if (!view) return callback(err);
  const rendered = view(options);
  return callback(null, rendered);
});
```
