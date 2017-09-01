var cookieSession = require('cookie-session');
var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var shortid = require('shortid');
var path = require('path');

var storage = multer.diskStorage({
  destination: './public/images',  
  filename: function(req, file, callback) {
		callback(null, shortid.generate() + path.extname(file.originalname))
	}
})
var upload = multer({storage: storage})


var sql = {
  comments: require("./sql/comments"),
  photos: require("./sql/photos"),
  ratings: require("./sql/ratings"),
  users: require("./sql/users")
};

var app = express();
app.use(express.static('public'));
app.use(function (req, res, next) {
  //res.setHeader('Access-Control-Allow-Origin', 'http://192.168.0.205:8080');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,accept,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

//Add post data to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(function (req, res, next) {
  console.log(req.method + ', url: ' + req.url);
  next();
});
//Get cookies
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

app.use(function (req, res, next) {
  req.session.id = (req.session.id || 0);
  next();
});

//Comments
app.post('/addComment', function (req, res, next) {
  console.log(req.body.photoId, req.body.comment)
  console.log(req.body)
  sql.comments.addComment(req.body.photoId, req.session.id, req.body.comment)
    .then((name) => {
      res.json(name);
      res.end();
    });
});

app.post('/deleteCommentById', function (req, res, next) {
  console.log(req.body.commentId)
  sql.comments.deleteCommentById(req.body.commentId)
    .then(() => {
      res.send();
      res.end();
    });
});

app.post('/changeComment', function (req, res, next) {
  sql.comments.changeComment(req.body.commentId, req.body.bodyComment)
    .then(() => {
      res.send();
      res.end();
    });
});

app.post('/getCommentsByPhotoId', function (req, res, next) {
  const postId = req.body.postId
  sql.comments.getCommentsByPhotoId(postId)
    .then(comments => {
      res.send(comments);
      res.end();
    });
});


//CurrentUser
app.get('/getCurrentUser', function (req, res, next) {
  if (req.session.id == 0) {
    res.send({
      id: 0,
      name: '',
      login: ''
    });
    res.end();
  }
  else {
    sql.users.getCurrentUser(req.session.id)
      .then(user => {
        res.send(user);
        res.end();
      });
  }
});

app.post('/logout', function (req, res, next) {
  req.session.id = 0;
  res.send({
    id: 0,
    name: '',
    login: ''
  });
  res.end();
});

//Photos
app.post('/addPhoto', function (req, res, next) {
  sql.photos.addPhoto(req.session.id, req.body.url, req.body.title, req.body.description)
    .then(photo => {
      res.send(photo);
      res.end();
    });
});

app.post('/addPost', upload.single('file'), function (req, res, next){
  if (!req.file)
    return res.status(400).send('No files were uploaded');
  else {
    let file = req.file;
    let extantion = path.extname(req.file.originalname);
    if (extantion !== '.png' && extantion !== '.gif' && extantion !== '.jpg' && extantion !== '.webp') {
      res.status(400).send('Only image are allowed!')
    } else {
      let url = `http://localhost:3000/images/${file.filename}`;
      let title = req.body.title;
      let description = req.body.description;
      sql.photos.addPhoto(req.session.id, url, title, description)
      .then((resp) => {
        res.json(resp);
      })
    }
  }
}); 

app.post('/deletePhotoById', function (req, res, next) {
  sql.photos.deletePhotoById(req.body.photoId, req.session.id)
    .then(() => {
      res.send();
      res.end();
    });
});

app.post('/changePhoto', function (req, res, next) {
  sql.photos.changePhoto(req.body.photoId, req.body.title, req.body.description, req.session.id)
    .then(photo => {
      res.send(photo);
      res.end();
    });
});

app.get('/getUserPhotos', function (req, res, next) {
  sql.photos.getUserPhotos(req.session.id)
    .then(photos => {
      res.send(photos);
      res.end();
    });
});

app.get('/getAllPhotos', function (req, res, next) {
  sql.photos.getAllPhotos(req.session.id)
    .then(photos => {
      res.send(photos);
      res.end();
    });
});

//Rating
app.post('/addRating', function (req, res, next) {
  sql.ratings.addRating(req.body.photoId, req.body.rating, req.session.id)
    .then(() => {
      res.send();
      res.end();
    });
});

//Users
app.get('/changeUser/:login/:name', function (req, res, next) {
  sql.users.checkLoginExistence(req.session.id, req.params.login)
    .then(loginExistence => {
      if (!loginExistence) {
        sql.users.changeUser(req.session.id, req.params.login, req.params.name)
          .then(() => {
            return sql.users.getCurrentUser(req.session.id);
          })
          .then(user => {
            res.send(user);
            res.end();
          });
      }
      else {
        res.send(false);
        res.end();
      }
    });
});

app.get('/getUserById/:userId', function (req, res, next) {
  var thisIsCurrentUser = (req.session.id === req.body.userId);
  sql.users.getUserById(req.params.userId, thisIsCurrentUser)
    .then(user => {
      res.send(user);
      res.end();
    });
});

app.post('/login', function (req, res, next) {
  sql.users.login(req.body.login, req.body.password, req.body.name)
    .then(user => {
      if (user) {
        req.session.id = user.id;
      }
      res.send(user);
      res.end();
    });
});

app.post('/register', function (req, res, next) {
  sql.users.register(req.body.login, req.body.password, req.body.name)
    .then(registrationIsDone => {
      if (!registrationIsDone) {
        res.send(false);
        res.end();
      }
      else {
        sql.users.login(req.body.login, req.body.password, req.body.name)
          .then(user => {
            if (user) {
              req.session.id = user.id;
            }
            res.send(user);
            res.end();
          });
      }
    });
});

app.listen(3000);