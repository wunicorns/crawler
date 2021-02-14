// const cp = require('child_process');
// const numCPUs = require('os').cpus().length;

const dbm = require('../database/mariadb')
const config = require('../config')

const crawl = require('../utility/crawl');
const logger = require('../utility/logger');
const service = require('../service/contentsCrawler')

module.exports.daily = async function(){

  console.log('daily job start')

  config.init();

  await dbm.init();

  const domain = 'https://www.mimint.co.kr';

  const urls = [
    '/talk/',
    '/food_n/',
    '/baby_n/',
    '/love_n/',
    '/life/'
  ];

  let links = [];
  for( const url of urls ){
    logger.info(' crawl :: ' + url);
    const $ = await crawl.getDocument(domain + url);
    for(const a of $(".wrap_left").find("a")){
      let href = a.attribs['href'];
      if(href.indexOf("bbs/list")>-1){
        links.push(a.attribs['href']);
      }
    }
  }

  links = links.filter((l, i)=>links.indexOf(l)===i);

  for(const link of links){
    const $ = await crawl.getDocument(domain + link);
    console.log(link);
    for(const tr of $("div.board_list_wrap tbody").find("tr")){
      try {
        const childs = $(tr).find("td");
        const dt = childs[childs.length - 1].children[0].data;
        const url = domain + childs[0].children.filter((el,i)=>el.name==='a')[0].attribs['href'];

        // console.log(url, new Date(dt));
        // const chk = await dbm.Contents.count({where: {url: url}});
        // if(chk>0) await dbm.Contents.destroy({where: {url: url}});

        let value = await service.crawlContentDetail({
          url: url,
          status: 3,
          lastmod: new Date(dt)
        });

        let inserted = await dbm.Contents.create(value);

        await service.parseContent(inserted);

        console.log(' \t :: ', inserted.id);

      } catch (error){
        console.log(error);
        logger.error(error);
      }
    }
  }

  // const batch = cp.spawn('./node_modules/forever/bin/forever start batch.js', []);
  //
  // batch.stdout.on('data', (data) => {
  //   console.log(`stdout: ${data}`);
  // });
  //
  // batch.stderr.on('data', (data) => {
  //   console.error(`stderr: ${data}`);
  // });
  //
  // batch.on('close', (code) => {
  //   console.log(`child process exited with code ${code}`);
  // });
  //
  // batch.on('error', (err) => {
  //   console.error(`child process error ${code}`);
  // });


}
