const express = require('express');
const bodyParser = require('body-parser');
const engines = require('consolidate');

const {requestHandler, errorHandler} = require('./middleware');
const {mainRouter} = require('./routes');
const viewRouter = require('./routes/view');

const mongodb = require('./database/mongo');


const PORT = 4000;

const {Contents, contentShema} = require('./database/model/contents');

(function(){

  mongodb.init();
  
  let cont = new Contents({
    name: 'hello world!',
    url: 'https://test.com',
    meta: {
      category1: 'cate1' ,
      category2: 'cate2' 
    },
    title: 'test 1',    
    content: 'test 2',
    status: 999
  });

  console.log(1);
  
  (async function(){
    await cont.save();
  })();
  console.log(3);
  return; 
  const app = express();

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.use(requestHandler);
  app.use(errorHandler);

  app.set('views', __dirname + '/views');

  // app.set('view engine', 'ejs');
  // app.engine('html', require('ejs').renderFile);

  app.engine('html', engines.mustache);
  app.set('view engine', 'html');

  app.use(express.static(__dirname + '/public'));

  app.use(viewRouter);
  app.use('/api', mainRouter);

  app.listen(PORT, ()=>{
    console.log(`server listen :: ${PORT}`);
  });

})();