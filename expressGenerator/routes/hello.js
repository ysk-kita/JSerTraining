var { check, validationResult }  = require('express-validator/check');
var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var mysql_setting = {
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'node_app'
};

/* GET home page. */
router.get('/', function(req, res, next) {

  if(false){
    var msg = "please Write";
    // sessionにmsgオブジェクトがあれば取り出して出力
    if(req.session.msg != undefined){
      msg = "Session Msg:" + req.session.msg
    }

    // var name = req.query.name;
    var data = {
      title: 'hello',
      content: msg
    };
    res.render('hello', data);
  }
  // データベースの設定情報
  var connection = mysql.createConnection(mysql_setting);
  // データベースに接続
  connection.connect();
  // データを取り出す
  connection.query('SELECT * from mydata',
          function (error, results, fields) {
      // データベースアクセス完了時の処理

      /* logをみる限り、dictを内包したリスト　
        [{...}, {...}, ..., {...}]
        logにはRow Data Packet という文字列ついてるけど無視して普通のDictと同じ用に使える
      console.log(results)
      console.log(results[0])
      console.log(results[0]['id'])
      */
      if (error == null) {
          var data = {
              //title: 'Hello/show',
              ///content: 'id = ' + id + ' のレコード：',
              //mydata: results[0]
              title: 'mysql',
              content: results
          }
          // views 配下の hello(dir)/index.ejsを呼び出してる
          res.render('hello/index', data);
      }
  });
  connection.end();
});

router.post('/send', function(req, res, next) {
  // sessionにmsgオブジェクトを追加
  req.session.msg = req.body['msg'];
  var data = {
    title: 'hello',
    content: "Session Msg:" + req.session.msg
  };
  res.render('hello/index', data);
});

// 新規作成ページへのアクセス
router.get('/add', (req, res, next) => {
  var data = {
      title: 'Hello/Add',
      content: '新しいレコードを入力：',
      form: {name:'', mail:'', age:0}
  }
  res.render('hello/add', data);
});

// validatorを追加
router.post('/add',[
  // check(<チェック要素>, <エラーメッセージ>).<チェック関数>()
  check('name', 'name needs').notEmpty(),
  check('mail', 'mail type').isEmail(),
  check('age', 'int type').isInt(),
], (req, res, next) => {
    // エラー情報の取り出し
    var errors = validationResult(req);
    if(!errors.isEmpty()){
      var re = '<ul class="error">';
      var res_array = errors.array();
      for (var n in res_array){
        re += '<li>'+ res_array[n].msg +'</li>';
      };
      re += '</ul>';

      var data = {
        title: 'Hello/Add/',
        content: re,
        form: req.body
      }
      res.render('hello/add', data);
    } else {

      var nm = req.body.name;
      var ml = req.body.mail;
      var ag = req.body.age;
      var data = {
        'name': nm, 'mail': ml, 'age': ag
      };

      // データベースの設定情報
      var connection = mysql.createConnection(mysql_setting);
      // データベースに接続
      connection.connect();

      connection.query('insert into mydata set ? ', data,
        function(error, results, fields){
          res.redirect('/hello');
      });

      connection.end();

    }
});

// 指定IDのレコードを表示する
router.get('/show', (req, res, next) => {
  var id = req.query.id;

  // データベースの設定情報
  var connection = mysql.createConnection(mysql_setting);

  // データベースに接続
  connection.connect();

  // データを取り出す
  connection.query('SELECT * from mydata where id=?', id,
          function (error, results, fields) {
      // データベースアクセス完了時の処理
      if (error == null) {
          var data = {
              title: 'Hello/show',
              content: 'id = ' + id + ' のレコード：',
              mydata: results[0]
          }
          res.render('hello/show', data);
      }
  });

  // 接続を解除
  connection.end();
});

module.exports = router;
