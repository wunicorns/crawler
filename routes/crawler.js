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

    // service.getSitemap(site);

    res.json({site});

  }catch(err){
    next(err);
  }
});

router.get('/crawl/contents', async (req, res, next)=>{

  try {

    // service.updateContents();

    res.json({});

  }catch(err){
    next(err);
  }

});

router.get('/crawl/contents/:id', async (req, res, next)=>{

  try {

    console.log(req.params);

    const id = req.params.id

    let article = await dbm.Articles.findOne({
      where: { id: id }
    });

    console.log('\t @ contents :: ', article.id, ", ", article.opt1);

    const cateId = article.opt1.split("=")[1];

    const gnu = GnuboardHelper.build()

    gnu.addArticle(cateId, {
      wr_subject: article.title,
      wr_content: article.content,
      wr_link1: ' ',
      wr_link2: ' ',
      wr_url: article.url,
      wr_datetime: article.lastmod
    });

    article.status = 2;
    article.save();

    res.json(article);

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
