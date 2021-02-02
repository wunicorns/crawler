const express = require('express');

const dbm = require('../database/mariadb')

const router = express.Router();

router.get('/', async (req, res, next)=>{

  try {

    let categories = await dbm.Contents.findAll({
      attributes: ['opt1', [dbm.sequelize.fn('count', '*'), 'cnt']],
      group: ['opt1'],
      raw: true
    })

    let contents = await dbm.Contents.findAll({
      limit: 50,
      raw: true,
      order: [['lastmod', 'desc']]
    });

    // res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});

    res.render('index', { categories: categories, contents: contents });

  }catch(err){
    next(err);
  }
});

module.exports = router;
