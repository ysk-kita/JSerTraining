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

// ★以下を追加
// knexでDBに接続する情報を定義
var knex = require('knex')({
  dialect: 'mysql',
  connection: {
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'node_app',
    charset  : 'utf8'
  }
});
// 先ほど定義したknex情報を利用して、bookshelfオブジェクトを定義
var Bookshelf = require('bookshelf')(knex);
// tableNameで指定したテーブルの情報を取得するModelオブジェクトを作成
var MyData = Bookshelf.Model.extend({
  tableName: 'mydata'
});
// ここまで

/* GET home page. */
router.get('/', function(req, res, next) {

  new MyData().fetchAll().then(function(collection){
    var data = {
      title: 'hello!',
      content: collection.toArray()
    };

    res.render('hello/index', data)
  }).catch(function(err){
    res.status(500).json({error: true, data: {message: err.message}});
  });

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
  }
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
      new MyData(req.body).save().then(function(model){
        res.redirect('/hello');
      });

      if(false){
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
    }
});

// 指定IDのレコードを表示する
router.get('/show', (req, res, next) => {
  var id = req.query.id;
  new MyData().where('id', '=', id).fetch().then(function(collection){
    var data = {
      title: 'Hello/show',
      content: 'id = ' + id + ' のレコード：',
      mydata: collection.attributes
  }
  res.render('hello/show', data);
  });

  if(false){
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
  }
});


// ページネーションの実現
Bookshelf.plugin('pagination');
router.get('/:page', function(req,res, next){
  var pg = req.params.page;
  console.log('page number:'+pg);
  // fetchPage({page: <ページ番号> , pageSize: <1page辺りの表示数>})
  new MyData().fetchPage({page: pg , pageSize: 2}).then(function(collection){
    var data = {
      title: 'hello page',
      content: collection.toArray(),
      pagination: collection.pagination
    };
    console.log(collection.pagination);
    res.render('hello/index', data);
  });
});

module.exports = router;
