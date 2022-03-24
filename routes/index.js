var express = require('express');
var router = express.Router();
var template = require('../lib/template');

// router : middlware면서도 요청을 받는 api역할
router.get('/', function (request, response) {
    var title = 'Welcome';
    var description = 'Hello, express';
    var list = template.list(request.list);
    var HTML = template.HTML(
      title, 
      list,
      ` <a href="/topic/create">create</a>`,
      `<h2>${title}</h2><p>${description}</p>
       <img src="/images/film.jpg" style="width:400px; display:block;">`
    );
    response.send(HTML);
});

module.exports = router;