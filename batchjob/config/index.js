const path = require('path')
const fs = require('fs')

const config = {
  init: function(){

    let configJson = JSON.parse(fs.readFileSync(path.join(__dirname + '/config.json')))

    global.config = configJson;

  }
}

module.exports = config
