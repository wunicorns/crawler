const express = require('express');

const crawl = require('../utility/crawl');
const logger = require('../utility/logger');
const dbm = require('../database/mariadb')

const service = require('../service/contentsCrawler')

const {GnuboardHelper} = require('../batchjob/service/gnuboard');

const router = express.Router();

router.post('/crawl', async (req, res, next)=>{
  try {

    const site = req.body.site;

    service.getSitemap(site);

    res.json({});

  }catch(err){
    next(err);
  }
});

router.get('/crawl/contents', async (req, res, next)=>{

  try {

    service.updateContents();

    res.json({});

  }catch(err){
    next(err);
  }

});

router.get('/crawl/contents/:id', async (req, res, next)=>{

  try {

    console.log(req.params);

    // service.updateContents();
    let [parsed, content] = await service.getParsedContent(req.params);

    console.log('\t @ contents :: ', parsed.id, ", ", parsed.opt1);

    const cateId = parsed.opt1.split("=")[1];

    const gnu = GnuboardHelper.build()

    gnu.addArticle({
      board: cateId,
      subject: parsed.title,
      content: parsed.content,
      wr_url: parsed.url,
      datetime: parsed.lastmod,
    });

    content.status = 1;
    content.save();

    res.json(parsed);

  }catch(err){
    next(err);
  }

});

router.post('/crawl/page', async (req, res, next)=>{

  try {

    const url = req.body.url;

    const $ = await crawl.getDocument(url);

    for(const el of $("a")){
      let href = el.attribs['href'];
      if(href.startsWith('/') || href.startsWith(url)){

      }
    }

    $("a").map((_, el)=>{

      console.log(el.attribs['href']);
    })

    res.json({});

  }catch(err){
    next(err);
  }

});

module.exports = {
    router
}
