import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import path from 'path';

const app = express();
const porta = 3000;

// Middleware
app.use(session({
    secret: 'M1nh4chav3S3cr3t4',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 30 } // 30 minutos
}));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), './paginas/publica')));

// Dados em memória
let usuarios = [];
let mensagens = [];

// Middleware de autenticação
function verificarSessao(req, res, next) {
    if (!req.session.loggedIn) {
        return res.redirect('/login.html');
    }
    next();
}

// Rota principal - Menu
app.get('/', (req, res) => {
    const ultimoAcesso = req.cookies.ultimoAcesso || 'Primeiro acesso';
    res.send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Menu Principal</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body {
                    background-color: #f5f5f5;
                    font-family: Arial, sans-serif;
                }
                .container {
                    background-color: white;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
                }
                h1 {
                    color: #333;
                }
                .btn {
                    margin: 10px;
                    width: 200px;
                    font-size: 16px;
                }
                .btn-primary {
                    background-color: #4CAF50;
                    border-color: #4CAF50;
                }
                .btn-primary:hover {
                    background-color: #45a049;
                    border-color: #45a049;
                }
                .btn-success {
                    background-color: #2196F3;
                    border-color: #2196F3;
                }
                .btn-success:hover {
                    background-color: #0b79e2;
                    border-color: #0b79e2;
                }
            </style>
        </head>
        <body>
            <div class="container text-center">
                <h1>Menu Principal</h1>
                <p>Último acesso: <strong>${ultimoAcesso}</strong></p>
                <a href="/cadastro" class="btn btn-primary">Cadastrar Usuário</a>
                <a href="/batepapo" class="btn btn-success">Bate-papo</a>
            </div>
        </body>
        </html>
    `);
});

// Rota para cadastro de usuários
app.get('/cadastro', verificarSessao, (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Cadastro de Usuários</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body {
                    background-color: #f5f5f5;
                    font-family: Arial, sans-serif;
                }
                .container {
                    background-color: white;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
                }
                h1 {
                    color: #333;
                }
                .form-control {
                    margin-bottom: 20px;
                }
                .btn {
                    width: 100%;
                    font-size: 18px;
                }
                .btn-primary {
                    background-color: #4CAF50;
                    border-color: #4CAF50;
                }
                .btn-primary:hover {
                    background-color: #45a049;
                    border-color: #45a049;
                }
                .btn-secondary {
                    background-color: #f44336;
                    border-color: #f44336;
                }
                .btn-secondary:hover {
                    background-color: #e53935;
                    border-color: #e53935;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1 class="text-center">Cadastro de Usuários</h1>
                <form method="POST" action="/cadastrarUsuario">
                    <div class="mb-3">
                        <label class="form-label">Nome</label>
                        <input type="text" name="nome" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Data de Nascimento</label>
                        <input type="date" name="dataNascimento" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Nickname</label>
                        <input type="text" name="nickname" class="form-control" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Cadastrar</button>
                </form>
                <div class="text-center mt-3">
                    <a href="/" class="btn btn-secondary">Voltar ao Menu</a>
                </div>
            </div>
        </body>
        </html>
    `);
});

// Processar cadastro
app.post('/cadastrarUsuario', verificarSessao, (req, res) => {
    const { nome, dataNascimento, nickname } = req.body;
    if (!nome || !dataNascimento || !nickname) {
        return res.send("Todos os campos são obrigatórios!");
    }
    usuarios.push({ nome, dataNascimento, nickname });
    res.redirect('/cadastro');
});

// Rota para bate-papo
app.get('/batepapo', verificarSessao, (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Bate-papo</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body {
                    background-color: #f5f5f5;
                    font-family: Arial, sans-serif;
                }
                .container {
                    background-color: white;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
                }
                h1 {
                    color: #333;
                }
                .form-control {
                    margin-bottom: 20px;
                }
                .btn {
                    width: 100%;
                    font-size: 18px;
                }
                .btn-success {
                    background-color: #2196F3;
                    border-color: #2196F3;
                }
                .btn-success:hover {
                    background-color: #0b79e2;
                    border-color: #0b79e2;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1 class="text-center">Bate-papo</h1>
                <form method="POST" action="/postarMensagem">
                    <div class="mb-3">
                        <label class="form-label">Usuário</label>
                        <select name="usuario" class="form-select" required>
                            ${usuarios.map(u => `<option value="${u.nickname}">${u.nome}</option>`).join('')}
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Mensagem</label>
                        <textarea name="mensagem" class="form-control" rows="3" required></textarea>
                    </div>
                    <button type="submit" class="btn btn-success">Enviar</button>
                </form>
                <ul class="list-group mt-3">
                    ${mensagens.map(m => `
                        <li class="list-group-item">
                            <strong>${m.usuario}</strong>: ${m.texto} <span class="text-muted float-end">${m.dataHora}</span>
                        </li>
                    `).join('')}
                </ul>
                <div class="text-center mt-3">
                    <a href="/" class="btn btn-secondary">Voltar ao Menu</a>
                </div>
            </div>
        </body>
        </html>
    `);
});

// Processar mensagens
app.post('/postarMensagem', verificarSessao, (req, res) => {
    const { usuario, mensagem } = req.body;
    if (!usuario || !mensagem.trim()) {
        return res.send("Usuário e mensagem são obrigatórios!");
    }
    mensagens.push({
        usuario,
        texto: mensagem,
        dataHora: new Date().toLocaleString()
    });
    res.redirect('/batepapo');
});

// Rota de login (página estática)
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(process.cwd(), './paginas/publica/login.html'));
});

// Rota de login (processamento)
app.post('/login', (req, res) => {
    req.session.loggedIn = true;
    res.cookie('ultimoAcesso', new Date().toLocaleString());
    res.redirect('/');
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.clearCookie('ultimoAcesso');
    res.send("Você saiu com sucesso! <a href='/'>Voltar ao Menu</a>");
});

// Inicia o servidor
app.listen(porta, () => {
    console.log(`Servidor rodando em http://localhost:${porta}`);
});
