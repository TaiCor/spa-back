var knex = require("./sqlConnectionOptions").knex;

function addRating(photoId, rating, currentUserId) {
  return knex('ratings')
    .where({
      photo_id: photoId,
      user_id: currentUserId
    })
    .del()
    .then(function () {
      return knex('ratings').insert({
        photo_id: photoId,
        user_id: currentUserId,
        rating: rating
      });
    }).then(id => {
      return id;
    });
}

exports.addRating = addRating;