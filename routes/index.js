const express = require('express');
const crawl = require('../utility/crawl');

const router = express.Router();

router.post('/crawl', async (req, res, next)=>{
  try {

    const site = req.body.site;

    let data = await crawl.getXmlToJson(site);

    console.log(data);

    res.json(data);

  }catch(err){
    next(err);
  }  
});

module.exports = {
    mainRouter: router
}