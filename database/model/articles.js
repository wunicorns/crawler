// const Sequelize = require('sequelize');
module.exports = function(sequelize, Sequelize){
  const {Model, DataTypes} = Sequelize;

  class Articles extends Model {}
    Articles.init({
    url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
    },
    title: {
        type: DataTypes.STRING,
    },
    opt1: {
        type: DataTypes.STRING,
    },
    opt2: {
        type: DataTypes.STRING,
    },
    opt3: {
        type: DataTypes.STRING,
    },
    opt4: {
        type: DataTypes.STRING,
    },
    opt5: {
        type: DataTypes.STRING,
    },
    opt6: {
        type: DataTypes.STRING,
    },
    opt7: {
        type: DataTypes.STRING,
    },
    opt8: {
        type: DataTypes.STRING,
    },
    opt9: {
        type: DataTypes.STRING,
    },
    opt10: {
        type: DataTypes.STRING,
    },
    content: {
        type: DataTypes.TEXT,
    },
    status: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    lastmod: {
        type: DataTypes.DATE
    },
    createDt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    timestamps: false,
    modelName: 'articles',
    tableName: 'articles'
  });

  return Articles;
}
