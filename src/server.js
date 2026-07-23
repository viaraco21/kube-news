const express = require('express');
const app = express();
const models = require('./models/post')
const bodyParser = require('body-parser')
const promBundle = require("express-prom-bundle");
const config = require('./system-life');
const middlewares = require('./middleware')
const { isValidPost } = require('./post-validation');

const metricsMiddleware = promBundle({
    includeMethod: true, 
    includePath: true, 
    includeStatusCode: true, 
    includeUp: true,
    promClient: {
        collectDefaultMetrics: {
        }
      }
});

app.use(middlewares.countRequests)
app.use(metricsMiddleware)
app.use(config.middlewares.healthMid);
app.use('/', config.routers);
app.use(express.static('static'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.set('view engine', 'ejs');


app.get('/post', (req, res) => {
    res.render('edit-news', {post: {title: "", content: "", summary: ""}, valido: true});
});

app.post('/post', async (req, res) => {
    const post = req.body || {};

    if (!isValidPost(post)) {
        return res.status(400).render('edit-news', {
            post: { title: post.title || '', content: post.description || '', summary: post.resumo || '' },
            valido: false
        });
    }

    try {
        await models.Post.create({ title: post.title, content: post.description, summary: post.resumo, publishDate: Date.now() });
        return res.redirect('/');
    } catch (error) {
        return res.status(500).render('edit-news', {
            post: { title: post.title, content: post.description, summary: post.resumo },
            valido: false
        });
    }
});

app.post('/api/post', async (req, res) => {
    const articles = req.body && req.body.artigos;

    if (!Array.isArray(articles)) {
        return res.status(400).json({ error: 'artigos must be an array' });
    }

    if (!articles.every(isValidPost)) {
        return res.status(400).json({ error: 'each article must contain valid fields' });
    }

    try {
        await models.Post.bulkCreate(articles.map((article) => ({
            title: article.title,
            content: article.description,
            summary: article.resumo,
            publishDate: Date.now()
        })));
        return res.status(201).json(articles);
    } catch (error) {
        return res.status(500).json({ error: 'unable to save articles' });
    }
});

app.get('/post/:id', async (req, res) => {

    const post = await models.Post.findByPk(req.params.id);
    res.render('view-news',{post: post});
});


app.get('/', async (req, res) => {

    const posts = await models.Post.findAll();
    res.render('index',{posts: posts});
});

async function start() {
    try {
        await models.initDatabase();
        app.listen(8080);
        console.log('Aplicação rodando na porta 8080');
    } catch (error) {
        console.error('Falha ao inicializar o banco de dados', error);
        process.exit(1);
    }
}

start();