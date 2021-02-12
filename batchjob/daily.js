const cp = require('child_process');
const numCPUs = require('os').cpus().length;

const dbm = require('./database/mariadb')
const config = require('./config')

const crawl = require('./utility/crawl');

config.init();

dbm.init().then(async ()=>{

  const domain = 'https://www.mimint.co.kr';

  const urls = [
    '/talk/',
    '/food_n/',
    '/baby_n/',
    '/love_n/',
    '/life/'
  ];

  let links = [];
  for( const url of urls ){
    const $ = await crawl.getDocument(domain + url);
    for(const a of $(".wrap_left").find("a")){
      let href = a.attribs['href'];
      if(href.indexOf("bbs/list")>-1){
        links.push(a.attribs['href']);
      }
    }
  }

  links = links.filter((l, i)=>links.indexOf(l)===i);

  for(const link of links){
    const $ = await crawl.getDocument(domain + link);
    console.log(link);
    for(const tr of $("div.board_list_wrap tbody").find("tr")){
      const childs = $(tr).find("td");
      const dt = childs[childs.length - 1].children[0].data;
      const url = domain + childs[0].children.filter((el,i)=>el.name==='a')[0].attribs['href'];
      console.log(url, new Date(dt));
      const chk = await dbm.Contents.count({where: {url: url}});
      if(chk>0) continue;
      let inserted = await dbm.Contents.create({
        url: url,
        lastmod: new Date(dt)
      });
      console.log(inserted.id);
    }
  }

  // const batch = cp.spawn('./node_modules/forever/bin/forever start batch.js', []);
  //
  // batch.stdout.on('data', (data) => {
  //   console.log(`stdout: ${data}`);
  // });
  //
  // batch.stderr.on('data', (data) => {
  //   console.error(`stderr: ${data}`);
  // });
  //
  // batch.on('close', (code) => {
  //   console.log(`child process exited with code ${code}`);
  // });
  //
  // batch.on('error', (err) => {
  //   console.error(`child process error ${code}`);
  // });

})
.catch(err=>{
  console.error(err);
});
