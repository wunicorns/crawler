const cheerio = require("cheerio");
const { Sequelize } = require('sequelize');

const crawl = require('../utility/crawl');
const logger = require('../utility/logger');
const dbm = require('../database/mariadb')

async function getSitemap (siteUrl) {

  let sitemap = await crawl.getXmlToJson(siteUrl);

  let jobs = [];
  for(const rst1 of sitemap.sitemapindex.sitemap){
    let sitemap = rst1.loc[0];
    console.log(sitemap, " :: running. ");
    let data = await crawl.getXmlToJson(sitemap);
    for(const content of data.urlset.url){
      console.log("\t-", content.loc[0]);
      let inserted = await dbm.Contents.create({
        url: content.loc[0],
        lastmod: new Date(content.lastmod[0])
      });
      console.log(inserted.id);

    }
  }

};

async function getContentDetail (link) {

  const html = await crawl.getText(link.url);

  let $ = cheerio.load(html);

  let title = $("title").text().trim();

  logger.info(title);

  let params = link.url.split('?')[1].split('&');

  let value = {title: title, content: html, status: 1};

  for(var i = 0 ; i < params.length ; i++){
      value['opt' + (i + 1)] = params[i];
  }

  const rst = await dbm.Contents.update(value, {
    where: {id: link.id}
  });

  logger.info(link.id + " :: " + link.url + " :: " + rst);

};

async function getContents () {

  let _list = await dbm.Contents.findAll({
    raw: true,
    where: {status: 0}
  });

  for(const link of _list){

    try {

      await getContentDetail(link);

    } catch(err){
      logger.info(link.id + " :: " + link.url);
      logger.error(err);
    }
  }

};


async function getPageLink (siteUrl) {

    const $ = await crawl.getDocument(siteUrl);

    $("a").map((el)=>{
      console.log(el);
    })

};


module.exports = {
  getSitemap,
  getContentDetail,
  getContents,
  getPageLink
}
