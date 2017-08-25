var knex = require("./sqlConnectionOptions").knex;

function normalizeComment(comment) {
  comment.edited = comment.edited == '0000-00-00 00:00:00'? null: comment.edited;
  return comment;
}

function getCommentsByPhotoId(photoId) {
  return knex('comments as c')
    .select('c.comment_id as id', 'c.user_id as author_id', 'u.name as author_name', 'c.commented', 'c.edited', 'c.comment', 'c.photo_id as photoId')
    .leftJoin('users as u', 'u.user_id', 'c.user_id')
    .where('c.photo_id', photoId)
    .then(comments => {
      return comments.map(comment => {
        return normalizeComment(comment);
      });
    });
}

function getUserByComment(comment_id){
  return knex('comments as c')
  .select('u.name as author_name', 'c.commented')
  .leftJoin('users as u', 'u.user_id', 'c.user_id')
  .where('c.comment_id', comment_id)
}

function changeComment(comment_id, comment) {
  return knex.raw(`update comments set comment = '${comment}' , edited = now() where comment_id = ${comment_id};`);
}

function deleteCommentById(comment_id) {
  return knex('comments')
    .where({
      comment_id: comment_id
    })
    .del();
}

function addComment(photo_id, user_id, comment) {
  return knex('comments')
    .insert({
      photo_id: photo_id,
      user_id: user_id,
      comment: comment
    })
    .then(id => {
      return getUserByComment(id);
    });
}

exports.getCommentsByPhotoId = getCommentsByPhotoId;
exports.changeComment = changeComment;
exports.deleteCommentById = deleteCommentById;
exports.addComment = addComment;
