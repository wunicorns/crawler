module.exports = function(sequelize, Sequelize){
  const {Model, DataTypes} = Sequelize;

  class ContentsParsed extends Model {}
  ContentsParsed.init({
    contentId: {
        type: DataTypes.INTEGER,
        field: 'content_id',
        defaultValue: 0
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        defaultValue: ""
    },
    opt1: {
        type: DataTypes.STRING,
        defaultValue: ""
    },
    opt2: {
        type: DataTypes.STRING,
        defaultValue: ""
    },
    opt3: {
        type: DataTypes.STRING,
        defaultValue: ""
    },
    opt4: {
        type: DataTypes.STRING,
        defaultValue: ""
    },
    opt5: {
        type: DataTypes.STRING,
        defaultValue: ""
    },
    content: {
        type: DataTypes.TEXT,
    },
    lastmod: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    parsedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'parsed_at'
    }
  }, {
    sequelize,
    timestamps: false,
    modelName: 'contents_parsed',
    tableName: 'contents_parsed'
  });

  return ContentsParsed;
}
