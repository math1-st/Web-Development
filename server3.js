var http = require('http');
var express = require('express');
var colors = require('colors');
var bodyParser = require('body-parser');
var mongodb = require("mongodb");

var app = express();
const MongoClient = mongodb.MongoClient;

// --- CONFIGURAÇÕES ---
app.use(express.static('./public')); // Pasta onde ficam as imagens (public/images)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', './views'); 

// --- CONEXÃO COM O BANCO ---
// IMPORTANTE: TROQUE 'senha_do_banco' PELA SUA SENHA REAL
const uri = 'mongodb+srv://banco_senha:senha_do_banco@cluster.h0wnutr.mongodb.net/?appName=Cluster';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log("Tentando conectar ao MongoDB...".yellow);

client.connect(err => {
    if (err) {
        console.error("ERRO CRÍTICO: Não foi possível conectar ao MongoDB.".red, err);
        return;
    }

    console.log("Conectado ao MongoDB com sucesso!".green);

    var dbo = client.db("webengines_bd");
    var colecao = dbo.collection("colecao");

    // =========================================
    // ROTAS
    // =========================================

    // Rota Principal -> Vai para o estoque
    app.get('/', function (req, res) {
        res.redirect('/stock');
    });

    // Rota STOCK (Visualizar Estoque)
    app.get("/stock", function (req, resp) {
        console.log("Buscando carros no banco...");

        colecao.find().toArray(function (err, lista) {
            if (err) {
                console.error("Erro ao buscar:", err);
                return resp.render("stock", { carros: [], resposta: "Erro de Conexão!" });
            }

            // Se a lista estiver vazia, avisa no console
            if (lista.length === 0) {
                console.log("AVISO: Banco conectado, mas lista vazia (Use a rota /popular-estoque)".magenta);
            } else {
                console.log(`Sucesso: ${lista.length} carros encontrados.`);
            }

            resp.render("stock", { carros: lista });
        });
    });

    // =========================================
    // ROTA DE EMERGÊNCIA - RODAR PARA ENCHER O BANCO
    // =========================================
    app.get("/popular-estoque", function (req, resp) {
        var estoqueInicial = [
            { carro: "twingo", preco: 5000, unidades: 0 }, 
            { carro: "alpine", preco: 10000, unidades: 2 },
            { carro: "kwid", preco: 45000, unidades: 100 },
            { carro: "ae86", preco: 85000, unidades: 0 }, 
            { carro: "onix", preco: 60000, unidades: 0 }, 
            { carro: "byd", preco: 100000, unidades: 100 }
        ];

        // Limpa o banco antes de inserir para não duplicar se rodar 2 vezes
        colecao.deleteMany({}, function(err, delResult) {
            colecao.insertMany(estoqueInicial, function (err, res) {
                if (err) {
                    resp.send("Erro ao popular: " + err);
                } else {
                    resp.send("<h1>Estoque criado com sucesso!</h1><p>Agora vá para <a href='/stock'>/stock</a> para ver os carros.</p>");
                }
            });
        });
    });

    // Rota para COMPRAR
    app.post("/webengines", function (req, resp) {
        const nome_carro = req.body.carro;
        console.log("Tentativa de compra:", nome_carro);

        colecao.findOne({ carro: nome_carro }, function(err, item){
            if(item && item.unidades > 0) {
                colecao.updateOne(
                    { carro: nome_carro },
                    { $inc: { unidades: -1 } },
                    function (err, result) {
                        if (err) return resp.status(500).send("Erro no banco");
                        
                        // Recarrega a página
                        colecao.find().toArray(function (err, lista) {
                            resp.render("stock", { carros: lista });
                        });
                    }
                );
            } else {
                resp.status(400).send("Sem estoque ou carro não encontrado");
            }
        });
    });

    // Rota Admin (Inserir manualmente)
    app.post("/admin", function (req, resp) {
        var data = {
            carro: req.body.carro, 
            preco: Number(req.body.preco),
            unidades: Number(req.body.unidades)
        };
        colecao.insertOne(data, function (err) {
            if (err) console.log(err);
            resp.redirect('/stock');
        });
    });

    // Inicia o servidor
    var server = http.createServer(app);
    server.listen(80, function() {
        console.log('Servidor rodando na porta 80 ...'.rainbow);
    });
});