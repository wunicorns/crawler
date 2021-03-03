const path = require('path');
const fs = require('fs');
const axios = require('axios');
const cheerio = require("cheerio");
const { Sequelize } = require('sequelize');

const crawl = require('../utility/crawl');
const logger = require('../utility/logger');
const dbm = require('../database/mariadb')

const IMG_EXT = [".jpg", ".gif", ".png", ".jpeg"];

async function getSitemap (siteUrl) {

  let sitemap = await crawl.getXmlToJson(siteUrl);

  let jobs = [];
  for(const rst1 of sitemap.sitemapindex.sitemap){
    let sitemap = rst1.loc[0];
    logger.info(sitemap + " :: running. ");
    let data = await crawl.getXmlToJson(sitemap);
    for(const content of data.urlset.url){
      logger.info("\t-" + content.loc[0]);
      let inserted = await dbm.Contents.create({
        url: content.loc[0],
        lastmod: new Date(content.lastmod[0])
      });

      logger.info(inserted.id);

    }
  }

};

/*
* new
*/
async function crawlContent (args) {

  try {

    const $ = await crawl.getDocument(args.url);

    let title = $("title").text().trim();

    let html = $(".board_content").html();

    let params = args.url.split('?')[1].split('&');

    let value = {title: title, content: html, status: 1};

    for(var i = 0 ; i < params.length ; i++){
        value['opt' + (i + 1)] = params[i];
    }

    return Object.assign({}, value, args);

  }catch(err){
    logger.error(err, 'error :: crawlContentDetail');
    throw err;
  }
};

async function parseContent (content) {

  try {

    const requst = axios.create();

    requst.defaults.timeout = 5000;

    const siteRoot = '/home/webcnt/web';

    let $doc = cheerio.load(content.content, null, false);

    let html = $doc.html();

    let $imgs = $doc("img");

    for(const $img of $imgs){

      const src = $img.attribs['src'];

      if(src.indexOf("?") > 0){
        src = src.substring(0, src.indexOf("?"));
      }

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

      let response = await requst.get(src, {
        responseType: 'stream'
      });

      if(response.status === 200) {
        const writeStream = fs.createWriteStream(siteImgPath)
        await response.data.pipe(writeStream);
        html = html.replace(src, imgPath)
      }

    }

    content.content = html;

    return content;

  }catch(err){
    logger.error (err, 'error :: parseContent');
    // console.error(err);
    throw err;
  }
};


async function _parseContent (content) {

  try {

    const requst = axios.create();

    requst.defaults.timeout = 5000;

    const siteRoot = '/home/webcnt/web';

    let $doc = cheerio.load(content.content)(".board_content");

    let html = $doc.html();

    let $imgs = $doc.find("img");

    for(const $img of $imgs){

      const imgSrc = $img.attribs['src'];

      if(!imgSrc) continue;

      let src = imgSrc;

      if(src && src.indexOf("?") > 0){
        src = src.substring(0, src.indexOf("?"));
        if(IMG_EXT.indexOf(path.extname(src)) < 0){
          let thumb = imgSrc.substring(imgSrc.indexOf("?") + 1);
          for(const [k,v] of thumb.split("&").map(el=>el.split("="))){
            if(k === 'thumb'){
              src = decodeURIComponent(v);
              break;
            }
          }
        }
      }

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

      logger.info(`\t\t\t - image :: ${siteImgPath} `);

      let response = await requst.get(src, {
        responseType: 'stream'
      });

      if(response.status === 200) {
        const writeStream = fs.createWriteStream(siteImgPath);
        await response.data.pipe(writeStream);
        html = html.replace(src, imgPath);
      }

      logger.info(`\t\t\t - image :: done. `);
    }

    return html;

  }catch(err){
    logger.info(`error :: parseContent`);
    // console.error(err);
    throw err;
  }
};


async function crawlContentDetail (args) {

  try {

    const $ = await crawl.getDocument(args.url);

    let title = $("title").text().trim();

    let html = $(".board_content").html();

    logger.info(title);

    let params = args.url.split('?')[1].split('&');

    let value = {title: title, content: html, status: 1};

    for(var i = 0 ; i < params.length ; i++){
        value['opt' + (i + 1)] = params[i];
    }

    return Object.assign({}, value, args);

  }catch(err){
    logger.error(err, 'error :: crawlContentDetail');
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
    logger.error(err, 'error :: updateContentDetail');    
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





async function getParsedContent (args) {
  try {

    let content = await dbm.Contents.findOne({
      where: { id: args.id }
    });

    return [await parseContent(content), content];

  }catch(err){
    logger.error(err, 'error :: getParsedContent');
    // console.error(err);
    throw err;
  }
};


async function getPageLink (siteUrl) {

    const $ = await crawl.getDocument(siteUrl);

    $("a").map((el)=>{
      logger.info(el);
    })

};


module.exports = {
  getSitemap,
  updateContentDetail,
  updateContents,
  getPageLink,

  getParsedContent,
  parseContent,
  _parseContent,
  crawlContentDetail,
  crawlContent
}
