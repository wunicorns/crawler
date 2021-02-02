const axios = require("axios");
const cheerio = require("cheerio");
const xml2js = require('xml2js');
const iconv = require('iconv-lite');

const log = console.log;

/*
-- axios
{
  data: {},
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {},
  request: {}
}
*/
const getText = async (url) => {
  try {

    const response = await axios.request({
      method: "GET",
      url: url,
      responseType: "arraybuffer",
      responseEncoding: "binary"
    });

    const cnt = Buffer.from(response.data, 'binary');

    return iconv.decode(cnt, "euc-kr").toString();

  } catch (error) {
    throw error;
  }
};

const getXmlToJson = async (url) => {
  try {

    const resp = await axios.get(url);
    const xmlParser = new xml2js.Parser();
    return await xmlParser.parseStringPromise(resp.data);

  } catch (error) {
    throw error;
  }
};

const getDocument = async (url) => {
  try {

    const resp = await axios.get(url, {
      responseType: 'arraybuffer',
      responseEncoding: 'binary'
    });

    const cnt = Buffer.from(resp.data, 'binary');
    const html = iconv.decode(cnt, "euc-kr").toString();
    return cheerio.load(html);

  } catch (error) {
    throw error;
  }
};

module.exports = {
  getText,
  getDocument,
  getXmlToJson
};
