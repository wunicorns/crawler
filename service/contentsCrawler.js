const path = require('path');
const fs = require('fs');
const axios = require('axios');
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

async function crawlContentDetail (args) {

  try {

    const html = await crawl.getText(args.url);

    let $ = cheerio.load(html);

    let title = $("title").text().trim();

    logger.info(title);

    let params = args.url.split('?')[1].split('&');

    let value = {title: title, content: html, status: 1};

    for(var i = 0 ; i < params.length ; i++){
        value['opt' + (i + 1)] = params[i];
    }

    return Object.assign({}, value, args);

  }catch(err){
    console.log('error :: crawlContentDetail');
    throw err;
  }
};

async function updateContentDetail (args) {
  try {

    let value = await crawlContentDetail({
      url: args.url
    });

    const rst = await dbm.Contents.update(value, {
      where: {id: args.id}
    });

    logger.info(args.id + " :: " + args.url + " :: " + rst);

    return value;

  }catch(err){
    console.log('error :: updateContentDetail');
    // console.log(args);
    // console.error(err);
    throw err;
  }
};

async function updateContents () {

  let _list = await dbm.Contents.findAll({
    raw: true,
    where: {status: 0}
  });

  for(const link of _list){

    try {

      await updateContentDetail(link);

    } catch(err){
      logger.info(link.id + " :: " + link.url);
      logger.error(err);
    }
  }

};


async function parseContent (content) {
  try {
    const siteRoot = '/home/webcnt/web';

    if(content.status === 0){
      content = await updateContentDetail(content);
    }

    let $doc = cheerio.load(content.content)(".board_content");

    let html = $doc.html();

    let $imgs = $doc.find("img");

    for(const $img of $imgs){
      const src = $img.attribs['src'];
      let imgPath = src;

      if(!imgPath.startsWith('/')){
        imgPath = imgPath.replace(/(http:\/\/|https:\/\/)/g, '');
        imgPath = imgPath.substring(imgPath.indexOf('/'))
      }

      imgPath = '/data/file' + imgPath;

      const siteImgPath = siteRoot + imgPath;

      if(!fs.existsSync(siteImgPath)){
        fs.mkdirSync(path.dirname(siteImgPath), { recursive: true })
      } else {
        fs.rmSync(siteImgPath);
      }

      let response = await axios.get(src, {responseType: 'stream'})
      const writer = fs.createWriteStream(siteImgPath)
      let result = await response.data.pipe(writer);

      html = html.replace(src, imgPath)

    }

    let data = await dbm.Contents.findOne({
      attributes: {exclude: [ 'content' ]},
      raw: true,
      where: { id: content.id }
    });

    let inserted = await dbm.ContentsParsed.create({
      contentId: data.id
      , url: data.url
      , title: data.title
      , opt1: data.opt1
      , opt2: data.opt2
      , opt3: data.opt3
      , opt4: data.opt4
      , opt5: data.opt5
      , content: html
      , lastmod: data.lastmod
      , parsedAt: new Date()
    });

    // return inserted.get({plain: true});
    return inserted;

  }catch(err){
    console.log('error :: parseContent');
    // console.error(err);
    throw err;
  }
};


async function getParsedContent (args) {
  try {

    let content = await dbm.Contents.findOne({
      where: { id: args.id }
    });

    return [await parseContent(content), content];

  }catch(err){
    console.log('error :: getParsedContent');
    // console.error(err);
    throw err;
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
  updateContentDetail,
  updateContents,
  getPageLink,

  getParsedContent,
  parseContent,
  crawlContentDetail
}
