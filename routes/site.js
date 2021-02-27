const express = require('express');
const jwt = require('../utility/jwt');
const dbm = require('../database/mariadb');
const uuid = require('uuid')

const router = express.Router();

router.get('/login', async (req, res, next)=>{
  try {



    res.render('login', {});

  }catch(error){
    next(error);
  }
});

router.get('/session', async (req, res, next)=>{
  try {

    //req.header.


    res.render('login', {});

  }catch(error){
    next(error);
  }
});

router.post('/login', async (req, res, next)=>{
  try {

    const userid = req.body.userid;
    const passwd = req.body.passwd;

    const token = await jwt.createToken({
      id: userid,
      uid: uuid.v4()
    });

    res.json({
      error: 0,
      access_token: token
    });

  } catch(error) {
    next(error);
  }
});

router.get('/', async (req, res, next)=>{

  try {

    let offset = 0;
    let limit = 30;

    let categories = await dbm.Articles.findAll({
      attributes: ['opt1', [dbm.sequelize.fn('count', '*'), 'cnt']],
      group: ['opt1'],
      raw: true
    })

    var whereCondition = {};

    if(req.query.status){
      whereCondition['status'] = req.query.status;
    }

    if(req.query.category){
      whereCondition['opt1'] = req.query.category;
    }

    const op = dbm.sequelize;

    let {rows, count} = await dbm.Articles.findAndCountAll({
      attributes: {
        include: [
          [op.fn('date_format', op.col('lastmod'), '%Y-%m-%d'), 'moddt'],
          [op.fn('date_format', op.col('createDt'), '%Y-%m-%d'), 'crawldt']
        ]
      },
      offset: offset,
      limit: limit,
      where: whereCondition,
      raw: true,
      order: [['lastmod', 'desc']]
    });

    res.render('index', {
      category: req.query.category || 'All',
      categories: categories,
      contents: rows,
      total_count: count
    });

  }catch(err){
    next(err);
  }
});

module.exports = router;
