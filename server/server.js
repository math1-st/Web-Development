var http = require('http');
var express = require('express');
var colors = require('colors');
var bodyParser = require('body-parser');
var mongodb = require("mongodb");

var app = express();
const MongoClient = mongodb.MongoClient;

// --- CONFIGURAÇÕES ---
app.use(express.static('./public')); 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', './views'); 

// --- CONEXÃO COM O BANCO ---
const uri = 'mongodb+srv://banco_senha:senha_do_banco@cluster.h0wnutr.mongodb.net/?appName=Cluster';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    if (err) {
        console.error("ERRO CRÍTICO: Sem conexão com banco.".red);
        return;
    }
    console.log("Banco Conectado!".green);

    var dbo = client.db("webengines_bd");
    
    // Coleção de Carros
    var colecao = dbo.collection("colecao");
    
    // Coleção de Usuários (O Mongo cria automaticamente ao inserir o primeiro dado)
    var colecaoUsuarios = dbo.collection("usuarios");

    // =========================================
    // ROTAS DE AUTENTICAÇÃO (Login/Cadastro)
    // =========================================

    // Rota Raiz -> Vai para o Login
    app.get('/', (req, res) => {
        res.redirect('/login');
    });

    // 1. TELA DE LOGIN
    app.get('/login', function(req, res) {
        res.render('login', { msg: null });
    });

    // 2. PROCESSAR LOGIN
    app.post('/login', function(req, res) {
        var usuario = req.body.usuario;
        var senha = req.body.senha;

        console.log(`Tentativa de login: ${usuario}`);

        colecaoUsuarios.findOne({ usuario: usuario, senha: senha }, function(err, user) {
            if (user) {
                console.log("Login aprovado!".green);
                res.redirect('/Buying a Car/webengines.html');
            } else {
                console.log("Login falhou.".red);
                res.render('login', { msg: "Usuário ou senha inválidos!" });
            }
        });
    });

    // 3. TELA DE CADASTRO
    app.get('/cadastro', function(req, res) {
        res.render('cadastro');
    });

    // 4. PROCESSAR CADASTRO
    app.post('/cadastra', function(req, res) {
        var novoUsuario = {
            usuario: req.body.usuario,
            senha: req.body.senha,
            nome: req.body.nome,
            sobrenome: req.body.sobrenome,
            cpf: req.body.cpf,
            nascimento: req.body.nascimento,
            cep: req.body.cep
        };

        // Verifica duplicidade
        colecaoUsuarios.findOne({ usuario: novoUsuario.usuario }, function(err, existente) {
            if (existente) {
                return res.send("<h1>Usuário já existe! <a href='/cadastro'>Voltar</a></h1>");
            }

            colecaoUsuarios.insertOne(novoUsuario, function(err) {
                if (err) return res.send("Erro no banco.");
                // Sucesso: vai para login
                res.redirect('/login');
            });
        });
    });


    // =========================================
    // API: Rota de Compra (Desconta 1 unidade)
    // =========================================
    app.post('/api/comprar', function(req, res) {
        var nome_carro = req.body.carro;
        console.log(`Tentativa de compra: ${nome_carro}`);

        // 1. Busca o carro para verificar o estoque
        colecao.findOne({ carro: nome_carro }, function(err, item) {
            if (err || !item) {
                return res.json({ sucesso: false, erro: "Carro não encontrado ou erro no banco." });
            }

            if (item.unidades > 0) {
                // 2. Se houver estoque, decrementa 1 unidade
                colecao.updateOne(
                    { carro: nome_carro },
                    { $inc: { unidades: -1 } }, // Decrementa 1 unidade
                    function(err, result) {
                        if (err || result.modifiedCount === 0) {
                            return res.json({ sucesso: false, erro: "Falha ao atualizar estoque." });
                        }
                        
                        console.log(`Venda realizada: ${nome_carro}. Restante: ${item.unidades - 1}`);
                        res.json({ sucesso: true, mensagem: `Compra do ${nome_carro} realizada!`, estoque_restante: item.unidades - 1 });
                    }
                );
            } else {
                // 3. Estoque esgotado
                res.json({ sucesso: false, erro: "Estoque esgotado!" });
            }
        });
    });

    // ... (restante do código do servidor, como a rota /stock e /admin)

    // =========================================
    // ROTAS DO SISTEMA (Estoque e Admin)
    // =========================================

    // Visualizar Estoque (Agora usa o arquivo que você mandou)
    app.get("/stock", function (req, resp) {
        colecao.find().toArray(function (err, lista) {
            if (err) return resp.render("stock", { carros: [], resposta: "Erro" });
            resp.render("stock", { carros: lista });
        });
    });

    // Admin Panel
    app.get("/admin", function(req, res) { res.render("admin"); });

    // API: Buscar dados do carro
    app.get("/api/carro/:nome", function(req, res) {
        colecao.findOne({ carro: req.params.nome.toLowerCase() }, function(err, item) {
            if(!item) return res.status(404).json({erro: "Não encontrado"});
            res.json(item);
        });
    });

    // API: Atualizar estoque (Admin)
    app.post("/api/atualizar-estoque", function(req, res) {
        colecao.updateOne(
            { carro: req.body.carro },
            { $set: { unidades: Number(req.body.unidades) } },
            function(err) { res.json({sucesso: true}); }
        );
    });

    // Rota de Popular Banco (Caso precise resetar)
    app.get("/popular-estoque", function (req, resp) {
        var estoqueInicial = [
            { carro: "twingo", preco: 5000, unidades: 0 }, 
            { carro: "alpine", preco: 10000, unidades: 2 },
            { carro: "kwid", preco: 45000, unidades: 100 },
            { carro: "ae86", preco: 85000, unidades: 0 }, 
            { carro: "onix", preco: 60000, unidades: 0 }, 
            { carro: "byd", preco: 100000, unidades: 100 }
        ];
        colecao.deleteMany({}, function() {
            colecao.insertMany(estoqueInicial, function () {
                resp.send("Estoque criado!");
            });
        });
    });

    var server = http.createServer(app);
    server.listen(3000, () => console.log('Rodando na porta 3000'.cyan));
});