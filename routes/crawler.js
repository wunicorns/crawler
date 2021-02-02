const express = require('express');

const crawl = require('../utility/crawl');
const logger = require('../utility/logger');
const dbm = require('../database/mariadb')

const service = require('../service/contentsCrawler')

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

    service.getContents();

    res.json({});

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
