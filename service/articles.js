const dbm = global.globalRequire('database/mariadb');

async function getArticleGroups(){

    let categories = await dbm.Articles.findAll({
      attributes: ['opt1', [dbm.sequelize.fn('count', '*'), 'cnt']],
      group: ['opt1'],
      raw: true
    });

    return categories;

}

async function getArticles(args){

    var whereCondition = {};

    if(args.status){
      whereCondition['status'] = args.status;
    }

    if(args.category){
      whereCondition['opt1'] = args.category;
    }

    const op = dbm.sequelize;

    return await dbm.Articles.findAndCountAll({
      attributes: {
        include: [
          [op.fn('date_format', op.col('lastmod'), '%Y-%m-%d'), 'moddt'],
          [op.fn('date_format', op.col('createDt'), '%Y-%m-%d'), 'crawldt']
        ]
      },
      offset: args.offset,
      limit: args.limit,
      where: whereCondition,
      raw: true,
      order: [['lastmod', 'desc']]
    });

}


module.exports = {
  getArticles,
  getArticleGroups
}
