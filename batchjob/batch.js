const cp = require('child_process');
const numCPUs = require('os').cpus().length;

const { Sequelize } = require('sequelize');

const dbm = require('../database/mariadb')
const config = require('../config')

async function start (){

  config.init();

  dbm.init().then(async ()=>{
    const Op = Sequelize.Op;

    const totalCount = (await dbm.Contents.findOne({
      attributes: [[dbm.sequelize.fn('count', '*'), 'cnt']],
      where: {status: {[Op.ne]: 5}},
      raw: true
    })).cnt;

    const eachCount = parseInt(totalCount / numCPUs);

    const jobList = [];

    for(var i = 0 ; i < numCPUs ; i++){

      const job = cp.fork(`batchjob/utility/job_batch.js`, [i]);

      job.on('message', (m) => {

        console.log('PARENT got message: ', m.jobId, ', ', m.initialized);

        job.send({
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

}

module.exports = {
  start
}
