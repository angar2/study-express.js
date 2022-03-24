var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var template = require('../lib/template');

// router : middlware면서도 요청을 받는 api역할
router.get('/create', function(request, response) {
    var title = 'Web - create';
    var list = template.list(request.list);
    var HTML = template.HTML(
      title,
      list,
      `<a href="/topic/create">create</a>`,
      `<form action="/topic/create_process" method="post">
          <p><input type="text" name="title" placeholder="title"></p>
          <p>
            <textarea name="description" placeholder="description"></textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>`
    );
    response.send(HTML);
});
  
router.post('/create_process', function(request, response) {
    var post = request.body;  // body-parser
    var title = post.title;
    var description = post.description;
    fs.writeFile(`data/${title}`, description, 'utf8', function (error) {
        response.redirect(`/topic/${title}`);
    })
});
  
router.get('/update/:pageId', function(request, response, next) {
    var filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function (error, description) {
        if(error) {
        next(error);  // next의 인자로 'route'이외의 어떤 값이 들어갈 경우 error로 인식하게끔 설계됨
        } else {
        var title = request.params.pageId;
        var list = template.list(request.list);
        var HTML = template.HTML(
            title, 
            list,
            `<a href="/topic/create">create</a> <a href="/topic/update/${title}">update</a>`,
            `<form action="/topic/update_process" method="post">
            <input type="hidden" name="id"  value=${title}>
            <p><input type="text" name="title" placeholder="title" value=${title}></p>
            <p>
                <textarea name="description" placeholder="description">${description}</textarea>
            </p>
            <p>
                <input type="submit">
            </p>
            </form>`
        );
        response.send(HTML);
        }
    });
})
  
router.post('/update_process', function(request, response){
    var post = request.body;  // body-parser
    var id = post.id;
    var title = post.title;
    var description = post.description;
    fs.rename(`data/${id}`, `data/${title}`, function (err) {
        fs.writeFile(`data/${title}`, description, 'utf8', function (err) {
        response.redirect(`/topic/${title}`);
        })
    })
});
  
router.post('/delete_process', function(request, response) {
    var post = request.body;  // body-parser
    var id = post.id;
    var filteredId = path.parse(id).base;
    fs.unlink(`data/${filteredId}`, function (error) {
        response.redirect('/');
    })
});
  
router.get('/:pageId', function (request, response, next) {
    var filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function (error, description) {
        if(error) {
        next(error);  // next의 인자로 'route'이외의 어떤 값이 들어갈 경우 error로 인식하게끔 설계됨
        } else {
        var title = request.params.pageId;
        var sanitizedTitle = sanitizeHtml(title);
        var sanitizedDescription = sanitizeHtml(description);
        var list = template.list(request.list);
        var HTML = template.HTML(
            sanitizedTitle, 
            list,
            ` <a href="/topic/create">create</a>
            <a href="/topic/update/${sanitizedTitle}">update</a>
            <form action="/topic/delete_process" method="post">
                <input type="hidden" name="id" value="${sanitizedTitle}">
                <input type="submit" value="delete">
            </form>`,
            `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
        );
        response.send(HTML);
        }
    });
});

module.exports = router;