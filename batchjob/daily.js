// const cp = require('child_process');
// const numCPUs = require('os').cpus().length;

const dbm = require('../database/mariadb')
const config = require('../config')

const crawl = require('../utility/crawl');
const logger = require('../utility/logger');
const service = require('../service/contentsCrawler')

const {GnuboardHelper} = require('./service/gnuboard');

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

        let value = await service.crawlContent({
          url: url,
          status: 1,
          lastmod: new Date(dt)
        });

        let inserted = await dbm.Articles.create(value);

        let article = await service.parseContent(inserted);

        const cateId = value.opt1.split("=")[1];

        const gnu = GnuboardHelper.build()

        gnu.addArticle({
          board: cateId,
          subject: article.title,
          content: article.content,
          wr_url: article.url,
          datetime: article.lastmod,
        });

        inserted.status = 2;
        inserted.content = article.content;
        inserted.save();

        console.log(' \t :: ', article.id);

      } catch (error){
        console.log(error);
        logger.error(error);
      }
    }
  }

}
