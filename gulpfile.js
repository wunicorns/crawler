const path = require('path')
const gulp = require('gulp')
const qs = require('querystring')

const axios = require('axios')
const cheerio = require('cheerio')

const dbm = require('./database/mariadb')
const config = require('./config')

const logger = require('./utility/logger');

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

function clean(cb){
  console.log(`clean run`);
  cb();
}

/*
* console print contents groups
*/
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

/*
* contents group database -> gnuboard board
*/
// gulp.task('new:category', async function  (cb){
//   const {GnuboardHelper} = require('./batchjob/service/gnuboard');
//   config.init();
//   dbm.init().then(async ()=>{
//     try {
//       let result = await dbm.sequelize.query(' select opt1, count(*) from contents where status = 1 group by opt1 '
//         , { type: dbm.sequelize.QueryTypes.SELECT, raw: true });
//
//       for(const row of result){
//         const cateId = row.opt1.split("=")[1];
//         if(!cateId || !isNaN(cateId)) continue;
//
//         console.log(cateId);
//
//         const gnu = GnuboardHelper.build()
//
//         gnu.addBoard({
//           id: cateId,
//           groupId: 'community',
//           name: cateId
//         });
//
//       }
//     }catch(err){
//       console.error(err);
//     }finally {
//       database.close();
//       cb();
//     }
//   });
//   console.log(`category run`);
// });

// gulp.task('articles', async function(cb){
// });

gulp.task('articles', async function(cb){

  logger.info('start !!! ');

  config.init();

  await dbm.init();

  const service = require('./service/contentsCrawler')

  let contentsList = await dbm.sequelize.query(' select id from contents where status <> 5 '
    , { type: dbm.sequelize.QueryTypes.SELECT, raw: true });

  for(const row of contentsList){

    try {

      let content = await dbm.Contents.findOne({
        where: { id: row.id }
      });

      let articleCount = await dbm.Articles.count({
        where: {
          url: content.url
        }
      });

      if(articleCount < 1) {
        try {
          let inserted = await dbm.Articles.create({
            url: content.url
            , name: content.name
            , title: content.title
            , opt1: content.opt1
            , opt2: content.opt2
            , opt3: content.opt3
            , opt4: content.opt4
            , opt5: content.opt5
            , content: await service._parseContent(content)
            , status: 1
            , lastmod: content.lastmod
          });

          logger.info(`\t success @ contents :: ${inserted.id}, ${inserted.opt1} `);

          content.status = 5;
          content.save();

        } catch(err) {

          logger.error(err, `\t error -- @ contents :: ${content.id}, ${content.opt1} `);

          content.status = 6;
          content.save();
        }
      }

    }catch(err){
      console.error(err);
    }
  }

  cb();

});


gulp.task('articles:multi', async function(cb){

    logger.info(' running articles:multi !!!!! ')

    const job = require('./batchjob/batch.js');

    await job.start();

    logger.info(' job:daily done !!!!! ')

    cb();

});



gulp.task('job:daily', async function(cb){

  logger.info(' running job:daily !!!!! ')

  const job = require('./batchjob/daily.js');

  const domain = 'https://www.mimint.co.kr';

  const urls = [
    '/talk/',
    '/food_n/',
    '/baby_n/',
    '/love_n/',
    '/life/'
  ];

  await job.daily(domain, urls);

  logger.info(' job:daily done !!!!! ')

  cb();

});

gulp.task('job:daily:baby', async function(cb){
  logger.info(' running job:daily !!!!! ')
  const job = require('./batchjob/daily.js');
  const domain = 'https://www.mimint.co.kr';
  const urls = ['/baby_n/',];
  await job.daily(domain, urls);
  logger.info(' job:daily done !!!!! ')
  cb();
});

gulp.task('job:daily:talk', async function(cb){
  logger.info(' running job:daily !!!!! ')
  const job = require('./batchjob/daily.js');
  const domain = 'https://www.mimint.co.kr';
  const urls = ['/talk/',];
  await job.daily(domain, urls);
  logger.info(' job:daily done !!!!! ')
  cb();
});

gulp.task('job:daily:love', async function(cb){
  logger.info(' running job:daily !!!!! ')
  const job = require('./batchjob/daily.js');
  const domain = 'https://www.mimint.co.kr';
  const urls = ['/love_n/',];
  await job.daily(domain, urls);
  logger.info(' job:daily done !!!!! ')
  cb();
});

gulp.task('job:daily:life', async function(cb){
  logger.info(' running job:daily !!!!! ')
  const job = require('./batchjob/daily.js');
  const domain = 'https://www.mimint.co.kr';
  const urls = ['/life/',];
  await job.daily(domain, urls);
  logger.info(' job:daily done !!!!! ')
  cb();
});

gulp.task('job:daily:food', async function(cb){
  logger.info(' running job:daily !!!!! ')
  const job = require('./batchjob/daily.js');
  const domain = 'https://www.mimint.co.kr';
  const urls = ['/food_n/',];
  await job.daily(domain, urls);
  logger.info(' job:daily done !!!!! ')
  cb();
});


gulp.task('job:daily:test', async function(cb){

  logger.info(' running job:daily:test !!!!! ')

  const job = require('./batchjob/daily_check.js');

  await job.daily();

  logger.info(' job:daily done !!!!! ')

  cb();

});


gulp.task('article:insert', async function(cb){

  logger.info(' running article:insert !!!!! ')

  config.init();

  await dbm.init();

  const {GnuboardHelper} = require('./batchjob/service/gnuboard');

  const service = require('./service/contentsCrawler')

  let contentsList = await dbm.sequelize.query(' select id from articles where status = 1 '
    , { type: dbm.sequelize.QueryTypes.SELECT, raw: true });


  const gnu = GnuboardHelper.build()

  for(const row of contentsList){
    try {

      let content = await dbm.Articles.findOne({
        where: { id: row.id }
      }, {raw: true});

      console.log('====================================================');
      console.log('\t @ contents :: ', content.id, ", ", content.opt1);

      const cateId = content.opt1.split("=")[1];

      gnu.addArticle(cateId, {
        wr_subject: content.title,
        wr_content: content.content,
        wr_link1: ' ',
        wr_link2: ' ',
        wr_url: content.url,
        wr_datetime: content.lastmod
      });

      content.status = 2;
      content.save();

      console.log('\t - contents :: ', content.id , ' done!');

    }catch(err){
      console.error(err);
    }
  }

  logger.info(' article:insert done !!!!! ')

  cb();

});



gulp.task('test:daily', async function(cb){

  logger.info('start !!! ');

  config.init();

  await dbm.init();

  const {GnuboardHelper} = require('./batchjob/service/gnuboard');

  const service = require('./service/contentsCrawler')

  let contentsList = await dbm.sequelize.query(' select * from articles where status = 1 '
    , { type: dbm.sequelize.QueryTypes.SELECT, raw: true });

  for(const row of contentsList){
    try {

      let content = await dbm.Articles.findOne({
        where: { id: row.id }
      });

      console.log('====================================================');
      console.log('\t @ contents :: ', content.id, ", ", content.opt1);

      const cateId = content.opt1.split("=")[1];

      let parsed = await service.parseContent(content);

      const gnu = GnuboardHelper.build()

      gnu.addArticle(cateId, {
        wr_subject: content.title,
        wr_content: parsed.content,
        wr_link1: ' ',
        wr_link2: ' ',
        wr_url: content.url,
        wr_datetime: content.lastmod
      });

      content.status = 2;
      content.save();

      console.log('\t - contents :: ', content.id , ' done!');

    }catch(err){
      console.error(err);
    }
  }

  cb();

});

exports.default = gulp.series(['job:daily']);
