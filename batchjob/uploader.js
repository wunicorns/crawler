const cp = require('child_process');
const cheerio = require('cheerio');
const numCPUs = require('os').cpus().length;

const dbm = require('./database/mariadb')
const config = require('./config')

config.init();

dbm.init().then(async ()=>{
// board_content
  const domain = 'https://www.mimint.co.kr';

  const urls = [
    '/talk/',
    '/food_n/',
    '/baby_n/',
    '/love_n/',
    '/life/'
  ];

  let links = [];
  
  let result = await dbm.sequelize.query(' select opt1, count(*) from contents where status = 1 group by opt1 ', { type: dbm.sequelize.QueryTypes.SELECT, raw: true });
  
  for(const row of result){
	  console.log(row);
  }
  
  /*
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
  */
  
})
.catch(err=>{
  console.error(err);
});
