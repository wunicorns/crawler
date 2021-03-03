const express = require('express');
const jwt = require('../utility/jwt');
const uuid = require('uuid')

const dbm = global.globalRequire('database/mariadb');

const articles = require('../service/articles');

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

router.get('/logout', async (req, res, next)=>{
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

    const auth = await dbm.checkAccount({
      username: userid,
      password: passwd
    });

    if(auth){
      const token = await jwt.createToken({
        id: userid,
        uid: uuid.v4()
      });

      res.json({
        error: 0,
        access_token: token
      });
    } else {
      res.json({error: 1});
    }

  } catch(error) {
    next(error);
  }
});

router.get('/', async (req, res, next)=>{

  try {

    let offset = 0;
    let limit = 30;

    let categories = await articles.getArticleGroups();

    let {rows, count} = await articles.getArticles({
      status: req.query.status || '',
      category: req.query.category || '',
      offset,
      limit
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
