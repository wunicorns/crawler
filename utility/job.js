const crawl = require('./crawl');
const dbm = require('../database/mariadb')
const config = require('../config')
const service = require('../service/contentsCrawler')
const logger = require('./logger');

const jobId = process.argv[2];

config.init();

dbm.init().then(()=>{

  console.log(global.config);

  process.on('message', async (m) => {
    console.log('CHILD got message:', m);

    let _list = await dbm.Contents.findAll(Object.assign({
      raw: true,
      where: {status: 0},
      offset: jobId * m.limit
    }, m.last ? {}: {limit: m.limit}));

    for(const link of _list){

      try {

        console.log(link);

        await service.getContentDetail(link);

      } catch(err){
        logger.info(link.id + " :: " + link.url);
        logger.error(err);
      }
    }

  });

  // Causes the parent to print: PARENT got message: { foo: 'bar', baz: null }
  process.send({ initialized: true, jobId: jobId });


})
.catch(err=>{
  console.error(err);
});
