var knex = require('knex')({
  client: 'mysql',
  connection: {
    host: 'localhost',
    port: '5000',
    user: 'root',
    password: 'vandal123',
    database: 'photo_album'
  }
});

exports.knex = knex;