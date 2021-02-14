const path = require('path')
const gulp = require('gulp')
const qs = require('querystring')

const axios = require('axios')
const cheerio = require('cheerio')

const dbm = require('./database/mariadb')
const config = require('./config')

// const zombie = require('zombie')

global.globalRequire = function(libPath) {
  return require(path.join(__dirname + '/' + libPath))
}


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

// gulp.task('getToken', async function(cb){
//
//   const resp1 = await axios.get(`${SITE_ADRESS}/bbs/login.php`, {headers: headers});
//
//   for(const rs of resp1.headers['set-cookie'].map(el=>el.split("; ")[0].trim())){
//     if(rs.startsWith('PHPSESSID')){
//       headers['cookie'] = rs + '; Path=/; Domain=.' + SITE_DOMAIN + ';';
//     }
//   }
//
//   const resp2 = await axios.post(`${SITE_ADRESS}/bbs/login_check.php`
//     , qs.stringify(loginInfo)
//     , {headers: headers});
//   const resp3 = await axios.get(`${SITE_ADRESS}/adm/ajax.token.php`, {headers: headers});
//   //
//   let article = require('./templates/article.json')
//
//   let articleData = Object.assign(article, {
//     'token': resp3.data.token,
//     bo_table: 'free',
//     wr_subject: "test 123",
//     wr_content: ""
//   });
//
//   const resp4 = await axios.post(`${SITE_ADRESS}/bbs/write_update.php`
//     , qs.stringify(articleData)
//     , {headers: headers});
//
//     console.log(resp4.data);
//
//   cb();
//
// });

gulp.task('addcategory', async function  (cb){

  config.init();

  dbm.init().then(async ()=>{

    const batchConfig = global.globalRequire('batchjob/config');
    batchConfig.init();
    const {Database} = require('./batchjob/database')
    let database = new Database();

    try {

      console.log(` database connected :: ${database.initialized}`)

      if(database.initialized){

        let boardTemplate = require('./batchjob/templates/board.json')

        let result = await dbm.sequelize.query(' select opt1, count(*) from contents where status = 1 group by opt1 '
          , { type: dbm.sequelize.QueryTypes.SELECT, raw: true });

        for(const row of result){
          const cateId = row.opt1.split("=")[1];
          if(!cateId || !isNaN(cateId)) continue;

          console.log(cateId);

          let boardData = Object.assign({}, boardTemplate, {
            bo_table: cateId
            , gr_id: "community"
            , bo_subject: cateId
          })

          let keys = Object.keys(boardData)
          let values = Object.values(boardData)

          let columns = keys.join(', ')
          let columnValues = keys.map(_=>'?').join(', ')

          let sql = ` insert into g5_board (${columns}) values (${columnValues}) `;

          const conn = await database.beginTransaction();

          let result = await conn.query (sql, values);

          if(result.affectedRows < 1){
            await conn.rollback();
          } else {

            let createSql = `
            CREATE TABLE IF NOT EXISTS g5_write_${cateId} (
              wr_id int(11) NOT NULL AUTO_INCREMENT,
              wr_num int(11) NOT NULL DEFAULT '0',
              wr_reply varchar(10) NOT NULL,
              wr_parent int(11) NOT NULL DEFAULT '0',
              wr_is_comment tinyint(4) NOT NULL DEFAULT '0',
              wr_comment int(11) NOT NULL DEFAULT '0',
              wr_comment_reply varchar(5) NOT NULL,
              ca_name varchar(255) NOT NULL,
              wr_option set('html1','html2','secret','mail') NOT NULL,
              wr_subject varchar(255) NOT NULL,
              wr_content text NOT NULL,
              wr_seo_title varchar(255) NOT NULL DEFAULT '',
              wr_link1 text NOT NULL,
              wr_link2 text NOT NULL,
              wr_link1_hit int(11) NOT NULL DEFAULT '0',
              wr_link2_hit int(11) NOT NULL DEFAULT '0',
              wr_hit int(11) NOT NULL DEFAULT '0',
              wr_good int(11) NOT NULL DEFAULT '0',
              wr_nogood int(11) NOT NULL DEFAULT '0',
              mb_id varchar(20) NOT NULL,
              wr_password varchar(255) NOT NULL,
              wr_name varchar(255) NOT NULL,
              wr_email varchar(255) NOT NULL,
              wr_homepage varchar(255) NOT NULL,
              wr_datetime datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
              wr_file tinyint(4) NOT NULL DEFAULT '0',
              wr_last varchar(19) NOT NULL,
              wr_ip varchar(255) NOT NULL,
              wr_facebook_user varchar(255) NOT NULL,
              wr_twitter_user varchar(255) NOT NULL,
              wr_1 varchar(255) NOT NULL,
              wr_2 varchar(255) NOT NULL,
              wr_3 varchar(255) NOT NULL,
              wr_4 varchar(255) NOT NULL,
              wr_5 varchar(255) NOT NULL,
              wr_6 varchar(255) NOT NULL,
              wr_7 varchar(255) NOT NULL,
              wr_8 varchar(255) NOT NULL,
              wr_9 varchar(255) NOT NULL,
              wr_10 varchar(255) NOT NULL,
              PRIMARY KEY (wr_id),
              KEY wr_seo_title (wr_seo_title),
              KEY wr_num_reply_parent (wr_num,wr_reply,wr_parent),
              KEY wr_is_comment (wr_is_comment,wr_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
            `;

            await conn.query(createSql);
            await conn.commit();
            console.log(` ${cateId} insert done ! `)

          }

        }

      }

    }catch(err){

      console.error(err);

    }finally {
      database.close();
      cb();
    }


  });

  console.log(`category run`);

});

gulp.task('create_board', async function(cb){

  const batchConfig = global.globalRequire('batchjob/config');
  batchConfig.init();
  const {Database} = require('./batchjob/database')
  let database = new Database();

  try {

    console.log(` database connected :: ${database.initialized}`)

    if(database.initialized){

      let boardTemplate = require('./batchjob/templates/board.json')

      let boardData = Object.assign({}, boardTemplate, {
        bo_table: "test1"
        , gr_id: "community"
        , bo_subject: "test1"
      })

      let keys = Object.keys(boardData)
      let values = Object.values(boardData)

      let columns = keys.join(', ')
      let columnValues = keys.map(_=>'?').join(', ')

      let sql = ` insert into g5_board (${columns}) values (${columnValues}) `;

      // console.log('==========================================================')
      // console.log(sql);
      // console.log('----------------------------------------------------------')
      // console.log(values);
      // console.log('==========================================================')

      let result = await database.insert(sql, values)

      console.log(result);

      // let result = await database.select(` select * from g5_board limit 5 `)
      // for(const row of result){
      //   for(const [k, v] of Object.entries(row)){
      //     console.log(`, "${k}": "${v}"`);
      //   }
      //   console.log('----------------------------------------------------------')
      // }

    }

  }catch(err){

    console.error(err);

  }finally {
    database.close();
    cb();
  }


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

exports.default = gulp.series(clean);
