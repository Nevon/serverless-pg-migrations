const Migration = require("./migration");

const success = response => ({
  statusCode: 200,
  body: JSON.stringify(response)
});

const failure = response => ({
  statusCode: 500,
  body: JSON.stringify(response)
});

const handler = handlerName => (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const migration = new Migration(process.env.DATABASE_URL);

  migration
    [handlerName]()
    .then(migrations => {
      const response = migrations.map(({ file }) => file).join("\n");
      migration.close();
      callback(null, success(response));
    })
    .catch(err => {
      migration.close();
      callback(err);
    });
};

module.exports.up = handler("up");

module.exports.down = handler("down");
