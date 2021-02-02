const cp = require('child_process');
const numCPUs = require('os').cpus().length;

const dbm = require('./database/mariadb')
const config = require('./config')

config.init();

dbm.init().then(async ()=>{

  const totalCount = (await dbm.Contents.findOne({
    attributes: [[dbm.sequelize.fn('count', '*'), 'cnt']],
    where: {status: 0},
    raw: true
  })).cnt;

  const eachCount = parseInt(totalCount / numCPUs);

  const jobList = [];

  for(var i = 0 ; i < numCPUs ; i++){

    const job = cp.fork(`${__dirname}/utility/job.js`, [i]);

    job.on('message', (m) => {

      console.log('PARENT got message: ', m.jobId, ', ', m.initialized);

      job.send({
        status: 1,
        limit: eachCount,
        last: (i + 1) === numCPUs
      });

    });

    jobList.push({
      jobId: i, job
    });

  }

})
.then(()=>{
    dbm.sequelize.close();
})
.catch(err=>{
  console.error(err);
});
