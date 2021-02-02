// const Sequelize = require('sequelize');
module.exports = function(sequelize, Sequelize){
  const {Model, DataTypes} = Sequelize;

  class Link extends Model {}
  Link.init({
    url: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
    },
    text: {
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
    status: {
        type: DataTypes.STRING,
        defaultValue: 0
    },
    createDt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    timestamps: false,
    modelName: 'link',
    tableName: 'link'
  });

  return Link;
}
