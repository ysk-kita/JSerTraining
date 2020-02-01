const http = require('http');
const fs = require('fs');
const ejs = require('ejs');
const url = require('url');
const qs = require('querystring')

// fileの読み込みはnode.jsのワークスペースをルートとしてのパスで指定する
// 別ページで同じテンプレを利用してもエラーにはならない
const index_page = fs.readFileSync('ejs/index.ejs', 'utf8');
const other_page = fs.readFileSync('ejs/index.ejs', 'utf8');
const style_css = fs.readFileSync('css/style.css', 'utf8')
//const other_page = index_page

var server = http.createServer(getFromClient);
server.listen(3000);
console.log('server Launched');

function getFromClient(request, response){
  // ejsテンプレートに値を埋め込む。 コメントアウト内にテンプレート埋め込みがあった場合も埋め込むアクションを取るため注意


  var url_parts = url.parse(request.url, true);
  // defaultは必ずいれる
  switch (url_parts.pathname)  {
    case '/':
      response_index(request, response);
      break;

    // htmlからのcss読み込みに以下パスを利用している
    case '/style.css':
      response.writeHead(200, {'Content-Type': 'text/css'});
      response.write(style_css);
      response.end();
      break;

    case '/other':
      response_other(request, response);
      break;

    default:
      response.writeHead(200, {'Content-Type': 'text/plain'});
      response.end('no page...');
      break;
  }
}

// ★otherのアクセス処理
var data2 = {
  'Taro':['taro@yamada', '09-999-999', 'Tokyo'],
  'Hanako':['hanako@flower', '080-888-888', 'Yokohama'],
  'Sachiko':['sachi@happy', '070-777-777', 'Nagoya'],
  'Ichiro':['ichi@baseball', '060-666-666', 'USA'],
}

function response_index(request, response) {
  var msg = "※伝言を表示します。"
  var content = ejs.render(index_page, {
      title:"Index",
      content:msg,
      data: data2,
      filename: 'data_item',
  });
  response.writeHead(200, {'Content-Type': 'text/html'});
  response.write(content);
  response.end();
};

/*
-
  xxx.func(HogeFunc)
  function HogeFunc(fuga, piyo){ ... }
-
  xxx.func((fuga, piyo)=>{ ... })
は同義
*/


function response_other(request, response){
  var msg ="other";

  if (request.method == 'POST'){
    var body = '';
    // postのparse
    request.on('data', (data) =>{
      body += data;
    });
    // ivent終了
    request.on('end', ()=>{
      var post_data = qs.parse(body);
      msg += 'Post data:' + post_data.msg
      var other = ejs.render(other_page,{
        title: "other",
        content: msg
      });
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.write(other);
      response.end();
    });
  }
};
