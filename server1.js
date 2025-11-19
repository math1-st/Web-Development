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
resposta.redirect('/aula10/cadastro.html')
})

app.get('/', function (requisicao, resposta){
resposta.redirect('/aula10/login.html')
})

app.get('/inicio', function (requisicao, resposta){
var nome = requisicao.query.info;
console.log(nome);
})

app.post('/inicio', function (requisicao, resposta){
var data = requisicao.body.data;
console.log(data);
})

app.get('/login',function (requisicao, resposta){
var usuario = requisicao.query.usuario;
var senha = requisicao.query.senha;
resposta.render('resposta', {usuario, senha})
})

app.get('/cadastra',function (requisicao, resposta){
var usuario = requisicao.query.usuario;
var senha = requisicao.query.senha;
resposta.render('resposta', {usuario, senha})
})

app.get('/logar_usuario',function (requisicao, resposta){
var usuario = requisicao.query.usuario;
var senha = requisicao.query.senha;
resposta.render('resposta', {usuario, senha})
})

