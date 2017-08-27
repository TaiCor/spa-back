var knex = require('knex')({
  client: 'mysql',
  connection: {
    host: 'localhost',
    user: 'root',
    password: 'vandal123',
    database: 'photo_album'
  }
});

exports.knex = knex;