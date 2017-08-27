var knex = require("./sqlConnectionOptions").knex;

function normalizePhoto(photo) {
  photo.commonRating = photo.commonRating == null? 0: photo.commonRating;
  photo.userRating = photo.userRating == null? 0: photo.userRating;
  photo.updated = photo.updated == '0000-00-00 00:00:00'? null: photo.updated;
  return photo;
}

function getUserPhotos(userId) {
  var query = `select p.photo_id as id, url, title, description, p.user_id as author_id, u.name as author_name, created, updated, avg(ratingTable.rating) as commonRating, userRatingTable.rating as userRating
    from photos p
    left join (select user_id, name from users) u
    on p.user_id = u.user_id
    left join (select photo_id, rating from ratings) as ratingTable
    on p.photo_id = ratingTable.photo_id
    left join (select photo_id, user_id, rating from ratings where user_id = ${userId}) userRatingTable
    on p.photo_id = userRatingTable.photo_id
    where p.user_id = ${userId} group by p.photo_id`;
  return knex.raw(query)
  .then(photos => {
    return photos[0].map(photo => {
      return normalizePhoto(photo);
    });
  });
}

function getAllPhotos(userId) {
  var query = `select p.photo_id as id, url, title, description, p.user_id as author_id, u.name as author_name, created, updated, avg(ratingTable.rating) as commonRating, userRatingTable.rating as userRating
  from photos p
left join (select user_id, name from users) u
on p.user_id = u.user_id
left join (select photo_id, rating from ratings) as ratingTable
on p.photo_id = ratingTable.photo_id
left join (select photo_id, user_id, rating from ratings where user_id = ${userId}) userRatingTable
on p.photo_id = userRatingTable.photo_id
group by p.photo_id`;
  return knex.raw(query)
  .then(photos => {
    return photos[0].map(photo => {
      return normalizePhoto(photo);
    });
  });
}

function changePhoto(photoId, title, description, userId) {
  var updateQuery = `update photos set title = '${title}' ,description='${description}' , updated = now() where photo_id = `+photoId+`;`;
  return knex.raw(updateQuery)
  .then(() => {
      var query = `select p.photo_id as id, url, title, description, p.user_id as author_id, u.name as author_name, created, updated, avg(ratingTable.rating) as commonRating, userRatingTable.rating as userRating
      from photos p
      left join (select user_id, name from users) u
      on p.user_id = u.user_id
      left join (select photo_id, rating from ratings) as ratingTable
      on p.photo_id = ratingTable.photo_id
      left join (select photo_id, user_id, rating from ratings where user_id = ${userId}) userRatingTable
      on p.photo_id = userRatingTable.photo_id
      where p.photo_id = ${photoId} group by p.photo_id`;
    return knex.raw(query)
      .then(photos => {
        return normalizePhoto(photos[0][0]);
      });
  });
}

function deletePhotoById(photoId, user_id) {
  return knex('ratings')
    .where({
      photo_id: photoId
    })
    .del()
    .then(() => {
      return knex('comments').where({
        photo_id: photoId
      })
      .del();
    })
    .then(() => {
      return knex('photos')
        .where({
          user_id: user_id,
          photo_id: photoId
        })
        .del();
    });
}

function addPhoto(userId, url, title, description) {
  return knex('photos')
    .insert({
      user_id: userId,
      url: url,
      title: title,
      description: description
    })
    .then(photoId => {
      var query = `select p.photo_id as id, url, title, description, p.user_id as author_id, u.name as author_name, created, updated, avg(ratingTable.rating) as commonRating, commentsTable.comments as commentsLength, userRatingTable.rating as userRating
        from photos p
        left join (select user_id, name from users) u
        on p.user_id = u.user_id
        left join (select photo_id, rating from ratings) as ratingTable
        on p.photo_id = ratingTable.photo_id
        left join (select photo_id, count(photo_id) comments from photo_album.comments group by photo_id) commentsTable
        on p.photo_id = commentsTable.photo_id
        left join (select photo_id, user_id, rating from ratings where user_id = ${userId}) userRatingTable
        on p.photo_id = userRatingTable.photo_id
        where p.photo_id = ${photoId} group by p.photo_id`;
      return knex.raw(query)
        .then(photos => {
          return normalizePhoto(photos[0][0]);
        });
    });
}

exports.addPhoto = addPhoto;
exports.deletePhotoById = deletePhotoById;
exports.changePhoto = changePhoto;
exports.getAllPhotos = getAllPhotos;
exports.getUserPhotos = getUserPhotos;