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

  let remainCount = links.length;

  if(remainCount < 1) return;

  const gnu = GnuboardHelper.build();

  try {

    for(const link of links){

      const $ = await crawl.getDocument(domain + link);

      console.log(link);

      for(const tr of $("div.board_list_wrap tbody").find("tr")){
        try {

          const childs = $(tr).find("td");
          const dt = childs[childs.length - 1].children[0].data;

          const aTag = $(childs[0].children.filter((el,i)=>el.name==='a')[0]);

          const url = domain + aTag.attr('href');

          let value = await service.crawlContent({
            url: url,
            status: 1,
            lastmod: new Date(dt)
          });

          let articleCount = await dbm.Articles.count({
            where: { url: url }
          });

          console.log("\t", remainCount--, aTag.text(), ' :: crawl - ', (articleCount > 0 ? "exist" : "new"));

          if(articleCount > 0) continue;

          let inserted = await dbm.Articles.create(value);

          let article = await service.parseContent(inserted);

          const cateId = value.opt1.split("=")[1];

          gnu.addArticle({
            board: cateId,
            wr_subject: article.title,
            wr_content: article.content,
            wr_link1: ' ',
            wr_link2: ' ',
            wr_url: article.url,
            wr_datetime: article.lastmod
          });

          inserted.status = 2;
          inserted.content = article.content;
          inserted.save();

          console.log(' \t :: ', article.id, ", remain :: ", remainCount);

        } catch (error){
          // console.log(error);
          logger.error(error);
        }
      }
    }

  } finally {
    await gnu.close();
    console.log("@job:daily done");
  }

}
