const gulp = require('gulp')
const qs = require('querystring')

const axios = require('axios')
const cheerio = require('cheerio')

const dbm = require('./database/mariadb')
const config = require('./config')

// const zombie = require('zombie')

const SITE_DOMAIN = 'webcnt.redpost.co.kr';
const SITE_ADRESS = `http://${SITE_DOMAIN}`;

const loginInfo = {
  url: encodeURIComponent(SITE_ADRESS)
  , mb_id: 'admin'
  , mb_password: 'webcnt1!Q'
}

const headers = {
  Referer: SITE_DOMAIN
  , Host: 'webcnt.redpost.co.kr'
  , Pragma: 'no-cache'
  , Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
  , 'Accept-Encoding': 'gzip, deflate'
  , 'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
  , 'Cache-Control': 'no-cache'
  , Connection: 'keep-alive'
  // , 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
  // , 'Content-Type': 'multipart/form-data; charset=UTF-8'
  , 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.104 Safari/537.36'
}

// zombie.waitDuration = '30s';
// const browser = new zombie(headers);


// {
//   webcnt
//   webcnt1!Q
//   webcnt
//   localhost:3306
// }

// category
// daily batch
// content images get
// write to site

function clean(cb){
  console.log(`clean run`);
  cb();
}

gulp.task('category', async function  (cb){

  config.init();

  dbm.init().then(async ()=>{

    let result = await dbm.sequelize.query(' select opt1, count(*) from contents where status = 1 group by opt1 '
      , { type: dbm.sequelize.QueryTypes.SELECT, raw: true });

    for(const row of result){
      const cateId = row.opt1.split("=")[1];
      if(!cateId || !isNaN(cateId)) continue;

      console.log(cateId);

    }

    cb();

  });

  console.log(`category run`);

});

gulp.task('login', async function(cb){

  // await browser.visit(`${SITE_DOMAIN}/bbs/login.php`);
  //
  // browser.fill('#login_id', 'admin');
  // browser.fill('#login_pw', 'webcnt1!Q');
  //
  // await browser.pressButton('로그인');
  //
  // cb();

});

gulp.task('getToken', async function(cb){

  const resp1 = await axios.get(`${SITE_ADRESS}/bbs/login.php`, {headers: headers});

  for(const rs of resp1.headers['set-cookie'].map(el=>el.split("; ")[0].trim())){
    if(rs.startsWith('PHPSESSID')){
      headers['cookie'] = rs + '; Path=/; Domain=.' + SITE_DOMAIN + ';';
    }
  }

  // headers['Cookie'] = 'PHPSESSID=9nfqm7qh5h1nlcjualajfqvk4q; 2a0d2363701f23f8a75028924a3af643=MTEyLjE1Ni4xMDAuMTIy; e1192aefb64683cc97abb83c71057733=ZnJlZQ%3D%3D';

  const resp2 = await axios.post(`${SITE_ADRESS}/bbs/login_check.php`
    , qs.stringify(loginInfo)
    , {headers: headers});

  // console.log(resp2.headers);
  // console.log('---------------------------------');
  //
  const resp3 = await axios.get(`${SITE_ADRESS}/adm/ajax.token.php`, {headers: headers});
  //
  // console.log(resp3.data);


  let article = require('./templates/article.json')

  // for(const [k,v] of Object.entries(article)){
  //
  // }

  let articleData = Object.assign(article, {
    'token': resp3.data.token,
    bo_table: 'free',
    wr_subject: "test 123",
    wr_content: ""
  });

  const resp4 = await axios.post(`${SITE_ADRESS}/bbs/write_update.php`
    , qs.stringify(articleData)
    , {headers: headers});

    console.log(resp4.data);

  cb();

});

gulp.task('create_board', async function(cb){

  let board = require('./templates/board.json')

  let boardData = Object.assign(board, {
    bo_subject: '',
    bo_table: ''
  })

  console.log(board);

  cb();
});

gulp.task('create_article', async function(cb){

  let article = require('./templates/article.json')

  // for(const [k,v] of Object.entries(article)){
  //
  // }

  //
  // let boardData = Object.assign(article, {
  //   bo_table: 'free',
  //   wr_subject: "",
  //   wr_content: ""
  // });

  cb();
});

exports.token = gulp.series('login', 'getToken');
exports.default = gulp.series(clean);
