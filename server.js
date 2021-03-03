const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const engines = require('consolidate');

global.globalRequire = function(libPath) {
  return require(path.join(__dirname + '/' + libPath))
}

const {requestHandler} = require('./middleware/request-handler');
const {errorHandler} = require('./middleware/error-handler');
const {permissionHandler} = require('./middleware/permission-handler');

const {router: crawlerRoutes} = require('./routes/crawler');
const viewRouter = require('./routes/site');

const crawl = require('./utility/crawl');

const PORT = 4000;

const dbm = require('./database/mariadb')
const config = require('./config')

const app = express();

(async function (){

  config.init();

  await dbm.init();

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.use(requestHandler);
  app.use(errorHandler);

  app.set('views', __dirname + '/views');

  app.engine('html', engines.mustache);
  app.set('view engine', 'html');

  app.use(express.static(__dirname + '/public'));

  app.use(viewRouter);
  app.use('/api', crawlerRoutes);

})().then(()=>{

  app.listen(PORT, ()=>{
    console.log(`server listen :: ${PORT}`);
  });

}).catch(err=>{

  console.log(err);

});
