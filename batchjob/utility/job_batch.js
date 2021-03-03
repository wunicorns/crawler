const config = require('../../config')
const dbm = require('../../database/mariadb')
const service = require('../../service/contentsCrawler')
const logger = require('../../utility/logger');

const { Sequelize } = require('sequelize');

const jobId = process.argv[2];

config.init();

dbm.init().then(()=>{
  const Op = Sequelize.Op;

  console.log(global.config);

  process.on('message', async (m) => {
    console.log('CHILD got message:', m);

    let contentsList = await dbm.Contents.findAll(Object.assign({
      attributes: [ 'id' ],
      raw: true,
      where: {status: {[Op.ne]: 5}},
      offset: jobId * m.limit
    }, m.last ? {}: {limit: m.limit}));

    for(const row of contentsList){

      try {

        let content = await dbm.Contents.findOne({
          where: { id: row.id }
        });

        let articleCount = await dbm.Articles.count({
          where: {
            url: content.url
          }
        });

        if(articleCount < 1) {
          try {
            let inserted = await dbm.Articles.create({
              url: content.url
              , name: content.name
              , title: content.title
              , opt1: content.opt1
              , opt2: content.opt2
              , opt3: content.opt3
              , opt4: content.opt4
              , opt5: content.opt5
              , content: await service._parseContent(content)
              , status: 1
              , lastmod: content.lastmod
            });

            logger.info(`\t success @ contents :: ${inserted.id}, ${inserted.opt1} `);

            content.status = 5;
            content.save();

          } catch(err) {

            logger.error(err, `\t error -- @ contents :: ${content.id}, ${content.opt1} `);

            content.status = 6;
            content.save();
          }
        }

      }catch(err){
        console.error(err);
      }
    }

  });

  process.send({ initialized: true, jobId: jobId });


})
.catch(err=>{
  console.error(err);
});
