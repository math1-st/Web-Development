var http = require('http');
var express = require('express');
var colors = require('colors');
var bodyParser = require('body-parser');

var app = express();
app.use(express.static('./public'));
app.use(bodyParser.urlencoded({ extended: false}))
app.use(bodyParser.json())
app.set('view engine', 'ejs')
app.set('views', './views');

var server = http.createServer(app);
server.listen(3000);

console.log('Servidor rodando ...'.rainbow);

app.get('/', function (requisicao, resposta){
resposta.redirect('/aula11/cadastrar_post.html')
})

app.post('/inicio', function (requisicao, resposta){
var data = requisicao.body.data;
console.log(data);
})

// AULA 11

// conectando ao mongodb
var mongodb = require("mongodb");

const MongoClient = mongodb.MongoClient;

const uri = 'mongodb+srv://banco_senha:senha_do_banco@cluster.h0wnutr.mongodb.net/?appName=Cluster';
const client = new MongoClient(uri, { useNewUrlParser: true });

// Verificar Conexão com Mongo

client.connect(err => {
    if (err) {
        console.error('Erro na conexão com o MongoDB:', err);
        return;
    }
    console.log('Conectado ao MongoDB');

    // Banco e coleção
    var dbo = client.db("exemplo_bd");
    var posts = dbo.collection("posts");

    // Página inicial do blog — mostra os posts
    app.get("/blog", function(req, resp) {
      posts.find().sort({ _id: -1 }).toArray(function(err, lista) {
        if (err) {
          resp.render("blog", { posts: [], resposta: "Erro ao carregar posts!" });
        } else {
          resp.render("blog", { posts: lista });
        }
      });
    });

    // Rota para cadastrar um novo post
    app.post("/cadastrar_post", function(req, resp) {
      var data = {
        titulo: req.body.titulo,
        resumo: req.body.resumo,
        conteudo: req.body.conteudo,
        data: new Date()
      };

      posts.insertOne(data, function(err) {
        if (err) {
          console.log(err);
          resp.render("blog", { posts: [], resposta: "Erro ao cadastrar post!" });
        } else {
          posts.find().sort({ _id: -1 }).toArray(function(err, lista) {
            resp.render("blog", { posts: lista, resposta: "Post cadastrado com sucesso!" });
          });
        }
      });
    });
});
