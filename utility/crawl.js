const axios = require("axios");
const cheerio = require("cheerio");
const xml2js = require('xml2js');

const log = console.log;

/*
-- axios
{
  // `data` is the response that was provided by the server
  data: {},

  // `status` is the HTTP status code from the server response
  status: 200,

  // `statusText` is the HTTP status message from the server response
  statusText: 'OK',

  // `headers` the HTTP headers that the server responded with
  // All header names are lower cased and can be accessed using the bracket notation.
  // Example: `response.headers['content-type']`
  headers: {},

  // `config` is the config that was provided to `axios` for the request
  config: {},

  // `request` is the request that generated this response
  // It is the last ClientRequest instance in node.js (in redirects)
  // and an XMLHttpRequest instance in the browser
  request: {}
}
*/
const getText = async (url) => {
  try {

    const resp = await axios.get(url);

    return resp.data;

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

    const resp = await axios.get(url);

    const $ = cheerio.load(resp.data);
    
    console.log(resp.data);

    return $;

  } catch (error) {
    throw error;
  }
};

// getHtml()
//   .then(html => {
//     let ulList = [];
//     const $ = cheerio.load(html.data);
    
//     console.log(html.data);
//     // const $bodyList = $("div.headline-list ul").children("li.section02");
//     // $bodyList.each(function(i, elem) {
//     //   ulList[i] = {
//     //       title: $(this).find('strong.news-tl a').text(),
//     //       url: $(this).find('strong.news-tl a').attr('href'),
//     //       image_url: $(this).find('p.poto a img').attr('src'),
//     //       image_alt: $(this).find('p.poto a img').attr('alt'),
//     //       summary: $(this).find('p.lead').text().slice(0, -11),
//     //       date: $(this).find('span.p-time').text()
//     //   };
//     // });

//     // const data = ulList.filter(n => n.title);
//     return [];
//   })
//   .then(res => log(res));

module.exports = {
  getText,
  getDocument,
  getXmlToJson
};