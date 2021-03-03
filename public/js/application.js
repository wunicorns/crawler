var session = {
  init: function(){

    session.accessToken = sessionStorage.getItem('_access_token');

    if(!session.accessToken){
      location.href="login";
    }

  },
  get: function(url, params, callback){

    var queries = [];

    for(k in params){
      queries.push(k + "=" + encodeURIComponent(params[k]));
    }

    if(queries.length > 0){
      url += "?" + queries.join("&");
    }

    fetch(url, {
      method: 'get',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      }
    }).then(function(resp){
      if(callback) callback(resp);
    });

  },
  post: function(url, params, callback){

    fetch(url, {
      method: 'post',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(params)
    }).then(function(resp){
      if(callback) callback(resp);
    });

  },
  put: function(url, params){

  },
  delete: function(url, params){

  }
}

session.init();

// (function($){
//
//   $(function(){
//
//
//
//
//   });
//
// })(jQuery);
