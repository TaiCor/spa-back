var knex = require("./sqlConnectionOptions").knex;

function getUserById(userId) {
  return knex('users')
    .select('user_id as id', 'name')
    .where('user_id', userId)
    .then(users => {
      if (!users[0]) {
        return {
          user_id: 0,
          name: ''
        };
      }
      else {
        return users[0];
      }
    });
}

function getCurrentUser(userId) {
  return knex('users')
    .select('user_id as id', 'login', 'name')
    .where('user_id', userId)
    .then(users => {
      if (!users[0]) {
        return {
          id: 0,
          name: ''
        };
      }
      else {
        return users[0];
      }
    });
}

function checkLoginExistence(userId, login) {
  return knex('users')
    .select('user_id as id', 'name', 'login')
    .where('login', login)
    .andWhere('user_id', '<>', userId)
    .then(users => {
      if (users[0]) {
        return true;
      }
      else {
        return false;
      }
    });
}

function checkPassword(userId, password) {
  return knex('users')
  .select('password')
  .where('user_id', '=', userId)
  .then(resp => {
    console.log(resp['0'])
    if (resp['0'].password === password) {
      return true
    } else {
      return false
    }
  })
}

function updatePassword(userId, password) {
  console.log(password);
  return knex.raw(`update users set password = '${password}' where user_id = ${userId};`);
}

function changeUser(userId, login, name) {
  return knex.raw(`update users set login = '${login}' , name='${name}' where user_id = ${userId};`);
}


function login(login, password, name) {
  return knex('users')
    .select('user_id as id', 'name', 'login')
    .where({
      login: login,
      password: password
    })
    .then(users => {
      if (users[0]) {
        return {
          id: users[0].id,
          name: users[0].name,
          login: users[0].login
        };
      }
      else {
        return false;
      }
    });
}

function register(login, password, name) {
  return knex('users')
    .select('user_id')
    .where({
      login: login
    })
    .then(users => {
      if (users[0]) {
        return false;
      }
      else {
        return knex('users').insert({
          login: login,
          name: name,
          password: password
        })
          .then(id => {
            return id;
          });
      }
    });
}


exports.changeUser = changeUser;
exports.checkLoginExistence = checkLoginExistence;
exports.getUserById = getUserById;
exports.getCurrentUser = getCurrentUser;
exports.login = login;
exports.register = register;
exports.checkPassword = checkPassword;
exports.updatePassword = updatePassword;