var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// https://domain:port/users/hello がアクセスされたときにはここの処理を利用
router.get('/hello', function(req, res, next) {
  res.send('<h2>Hello!</h2>');
});


module.exports = router;
