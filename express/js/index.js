var express = require('express');
var ejs = require('ejs');

var app = express();
app.engine('ejs', ejs.renderFile);
app.use(express.static('public'));

var bodyParser = require('body-parser')
// querystringを使ってエンコード & postプロパティをrequest.bodyに設定
app.use(bodyParser.urlencoded({extended: false}))


app.get('/',(req, res) => {
  // デフォルトではviews配下のejsファイルを見に行く
  res.render('index.ejs', {
    title: 'Index',
    content: 'top page',
    link: {
      href: '/other?name=Taro',
      text: 'move to other'
    }
  });
});

app.post('/', (req, res)=>{
  res.render('index.ejs', {
    title: 'Index',
    content: 'POST param:' + req.body.message,
    link: {
      href: '/other?name=Taro',
      text: 'move to other'
    }
  });
});

app.get('/other',(req, res) => {

  res.render('index.ejs', {
    title: 'Index',
    content: 'Get param:'+ req.query.name,
    link: {
      href: '/',
      text: 'Return to top'
    }
  });
});


app.listen(3000, () => {
  console.log('Start Server port:3000');
});
