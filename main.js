var http = require("http");
var fs = require("fs");
var url = require("url");
var qs = require("querystring");
var template = require("./lib/template.js");
var path = require("path");
var sanitizeHtml = require("sanitize-html");
var mysql = require("mysql");
var db = mysql.createConnection({
    host: "192.168.0.148",
    user: "term",
    password: "1234",
    database: "opentutorials",
});
db.connect();

var app = http.createServer(function (request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;

    if (pathname === "/") {
        if (queryData.id === undefined) {
            /* fs.readdir('./data', function (error, filelist) {
                var title = 'Welcome';
                var description = 'Hello, Node.js';
                var list = template.list(filelist);
                var html = template.html(title, list, `<h2>${title}</h2>${description}`, `<a href="/create">create</a>`);
                response.writeHead(200);
                response.end(html);
            }); */

            db.query("SELECT * FROM topic", function (error, topics) {
                console.log(topics);

                var title = "Welcome";
                var description = "Hello, Node.js";
                var list = template.list(topics);
                var html = template.html(title, list, `<h2>${title}</h2>${description}`, `<a href="/create">create</a>`);

                response.writeHead(200);
                response.end(html);
            });
        } else {
            /* fs.readdir('./data', function (error, filelist) {
                var filteredID = path.parse(queryData.id).base;
                fs.readFile(`data/${filteredID}`, 'utf8', function (err, description) {
                    var title = queryData.id;
                    var sanitizedTitle = sanitizeHtml(title);
                    var sanitizedDescription = sanitizeHtml(description, {
                        allowedTags: ['h1']
                    });
                    var list = template.list(filelist);
                    var html = template.html(title, list, `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`, `<a href="/create">create</a> 
                        <a href="/update?id=${sanitizedTitle}">update</a>
                        <form action="delete_process" method="post">
                            <input type="hidden" name="id" value="${sanitizedTitle}">
                            <input type="submit" value="delete">
                        </form>
                        `);
                    response.writeHead(200);
                    response.end(html);
                });
            }); */
            db.query("SELECT * FROM topic", function (error, topics) {
                if (error) {
                    throw error;
                }
                db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id = author.id where topic.id=?`, [queryData.id], function (error2, topic) {
                    if (error2) {
                        throw error2;
                    }

                    var title = topic[0].title;
                    var description = topic[0].description;
                    var list = template.list(topics);
                    var html = template.html(
                        title,
                        list,
                        `<h2>${title}</h2>${description}
                        <p>by ${topic[0].name}</p>`,
                        `<a href="/create">create</a> 
                        <a href="/update?id=${queryData.id}">update</a>
                        <form action="delete_process" method="post">
                            <input type="hidden" name="id" value="${queryData.id}">
                            <input type="submit" value="delete">
                        </form>`
                    );

                    response.writeHead(200);
                    response.end(html);
                });
            });
        }
    } else if (pathname === "/create") {
        /* fs.readdir("./data", function (error, filelist) {
            var title = "Web - create";
            var list = template.list(filelist);
            var html = template.html(
                title,
                list,
                `
                <form action="/create_process" method="post">
                    <p><input type="text" name="title" placeholder="title"></p>
                    <p>
                        <textarea name="description" placeholder="description"></textarea>
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                </form>
            `,
                ""
            );
            response.writeHead(200);
            response.end(html);
        }); */

        db.query("SELECT * FROM topic", function (error, topics) {
            db.query("SELECT * FROM author", function (error, authors) {
                
                var title = "Create";
                var list = template.list(topics);
                var html = template.html(
                    title,
                    list,
                    `
                    <form action="/create_process" method="post">
                        <p><input type="text" name="title" placeholder="title"></p>
                        <p>
                            <textarea name="description" placeholder="description"></textarea>
                        </p>
                        <p>
                            ${template.authorSelect(authors)}
                        </p>
                        <p>
                            <input type="submit">
                        </p>
                    </form>
                `,
                    `<a href="/create">create</a>`
                );

                response.writeHead(200);
                response.end(html);
            });
        });
    } else if (pathname === "/create_process") {
        var body = "";
        request.on("data", function (data) {
            body += data;
        });
        request.on("end", function () {
            var post = qs.parse(body);
            var title = post.title;
            var description = post.description;

            /* fs.writeFile(`data/${title}`, description, "utf-8", function (err) {
                response.writeHead(302, { Location: `/?id=${title}` });
                response.end();
            }); */

            db.query(`INSERT INTO topic (title, description, created, author_id) VALUES (?, ?, NOW(), ?)`, [title, description, post.author], function (error, result) {
                if (error) {
                    throw error;
                }
                response.writeHead(302, { Location: `/?id=${result.insertId}` });
                response.end();
            });
        });
    } else if (pathname === "/update") {
        /* fs.readdir("./data", function (error, filelist) {
            var filteredID = path.parse(queryData.id).base;
            fs.readFile(`data/${filteredID}`, "utf8", function (err, description) {
                var title = queryData.id;
                var list = template.list(filelist);
                var html = template.html(
                    title,
                    list,
                    `
                    <form action="/update_process" method="post">
                        <input type="hidden" name="id" value="${title}">
                        <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                        <p>
                            <textarea name="description" placeholder="description">${description}</textarea>
                        </p>
                        <p>
                            <input type="submit">
                        </p>
                    </form>
                `,
                    `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
                );
                response.writeHead(200);
                response.end(html);
            });
        }); */
        db.query("SELECT * FROM topic", function (error, topics) {
            if (error) {
                throw error;
            }
            db.query(`SELECT * FROM topic where id=?`, [queryData.id], function (error2, topic) {
                if (error2) {
                    throw error2;
                }
                var list = template.list(topics);
                var html = template.html(
                    topics[0].title,
                    list,
                    `
                    <form action="/update_process" method="post">
                        <input type="hidden" name="id" value="${topic[0].id}">
                        <p><input type="text" name="title" placeholder="title" value="${topic[0].title}"></p>
                        <p>
                            <textarea name="description" placeholder="description">${topic[0].description}</textarea>
                        </p>
                        <p>
                            <input type="submit">
                        </p>
                    </form>
                    `,
                    `<a href="/create">create</a> <a href="/update?id=${topic[0].title}">update</a>`
                );

                response.writeHead(200);
                response.end(html);
            });
        });
    } else if (pathname === "/update_process") {
        var body = "";
        request.on("data", function (data) {
            body += data;
        });
        request.on("end", function () {
            var post = qs.parse(body);
            var id = post.id;
            var title = post.title;
            var description = post.description;

            /* fs.rename(`data/${id}`, `data/${title}`, function (error) {
                fs.writeFile(`data/${title}`, description, "utf-8", function (err) {
                    response.writeHead(302, { Location: `/?id=${title}` });
                    response.end();
                });
            }); */

            db.query("UPDATE topic SET title=?, description=?, author_id=1 WHERE id=?", [title, description, id], function (error, result) {
                response.writeHead(302, { Location: `/?id=${id}` });
                response.end();
            });
        });
    } else if (pathname === "/delete_process") {
        var body = "";
        request.on("data", function (data) {
            body += data;
        });
        request.on("end", function () {
            var post = qs.parse(body);
            var id = post.id;

            var filteredID = path.parse(id).base;
            /* fs.unlink(`data/${filteredID}`, function (err) {
                response.writeHead(302, { Location: `/` });
                response.end();
            }); */

            db.query("DELETE FROM topic WHERE id=?", [id], function (error, result) {
                if (error) {
                    throw error;
                }
                response.writeHead(302, { Location: `/` });
                response.end();
            });
        });
    } else {
        response.writeHead(404);
        response.end("Not found");
    }
});
app.listen(3000);
