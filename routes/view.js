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

    var whereCondition = {};

    if(req.query.status){
      whereCondition['status'] = req.query.status;
    }

    const op = dbm.sequelize;

    let contents = await dbm.Contents.findAll({
      attributes: {
        include: [
          [op.fn('date_format', op.col('lastmod'), '%Y-%m-%d'), 'moddt'],
          [op.fn('date_format', op.col('createDt'), '%Y-%m-%d'), 'crawldt']
        ]
      },
      limit: 50,
      where: whereCondition,
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
