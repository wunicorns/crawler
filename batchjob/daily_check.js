// const cp = require('child_process');
// const numCPUs = require('os').cpus().length;

const dbm = require('../database/mariadb')
const config = require('../config')

const crawl = require('../utility/crawl');
const logger = require('../utility/logger');
const service = require('../service/contentsCrawler')

module.exports.daily = async function(){

  logger.info('daily job start')

  // config.init();
  // await dbm.init();

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
    const lefLink = $(".wrap_left").find("a");
    for(const a of lefLink){
      let href = $(a).attr("href");
      let txt = $(a).text();
      if(href.indexOf("bbs/list")>-1){
        logger.info(`\t - ${txt} :: ${href}`)
        // links.push(a.attribs['href']);
      }
    }
  }

}
