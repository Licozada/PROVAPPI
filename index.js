import express from 'express'; 
import session from 'express-session';
import cookieParser from 'cookie-parser';
import path from 'path';

const app = express();
const porta = 3000;

app.use(session({
    secret: 'M1nh4chav3S3cr3t4',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 30 } // 30 minutos
}));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), './paginas/publica')));


let usuarios = [];
let mensagens = [];


function verificarSessao(req, res, next) {
    if (!req.session.loggedIn) {
        return res.redirect('/login.html');
    }
    next();
}


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
            background-color: #e0f7fa; /* Azul claro de fundo */
            font-family: Arial, sans-serif;
        }
        .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #0d47a1; 
        }
        .btn {
            margin: 10px;
            width: 200px;
            font-size: 16px;
        }
        .btn-primary {
            background-color: #2196F3;
            border-color: #2196F3;
        }
        .btn-primary:hover {
            background-color: #1976d2; 
            border-color: #1976d2;
        }
        .btn-success {
            background-color: #1976d2; 
            border-color: #1976d2;
        }
        .btn-success:hover {
            background-color: #0d47a1; 
            border-color: #0d47a1;
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


app.get('/cadastro', verificarSessao, (req, res) => {
    const erro = req.query.erro;
    const { nome = '', dataNascimento = '', apelido = '' } = req.query;
    const mensagensErro = {
        nome: req.query.nomeErro || '',
        dataNascimento: req.query.dataNascimentoErro || '',
        apelido: req.query.apelidoErro || ''
    };

    const listaUsuarios = usuarios.map(u => `
        <li class="list-group-item">${u.nome} (Apelido: ${u.apelido}, Nascimento: ${u.dataNascimento})</li>
    `).join('') || '<li class="list-group-item text-muted">Nenhum usuário cadastrado ainda.</li>';

    res.send(`
        <!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Cadastro de Usuários</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background-color: #e0f7fa; 
            font-family: 'Arial', sans-serif;
        }
        .container {
            background-color: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0px 6px 18px rgba(0, 0, 0, 0.1);
            max-width: 800px;
            margin-top: 50px;
        }
        h1 {
            color: #0d47a1; 
            font-size: 32px;
            margin-bottom: 20px;
        }
        .form-control {
            margin-bottom: 20px;
            border-radius: 8px;
            box-shadow: inset 0 0 5px rgba(0,0,0,0.1);
        }
        .form-label {
            font-weight: bold;
        }
        .btn {
            width: 100%;
            font-size: 18px;
            border-radius: 8px;
            padding: 12px;
        }
        .btn-primary {
            background-color: #2196F3; 
            border-color: #2196F3;
        }
        .btn-primary:hover {
            background-color: #1976d2; 
            border-color: #1976d2;
        }
        .btn-secondary {
            background-color: #1976d2; 
            border-color: #1976d2;
        }
        .btn-secondary:hover {
            background-color: #0d47a1; 
            border-color: #0d47a1;
        }
        .list-group-item {
            border-radius: 8px;
        }
        .col-container {
            display: flex;
            justify-content: space-between;
        }
        .col-container .col {
            max-width: 48%;
        }
    </style>
        </head>
        <body>
            <div class="container">
                <h1 class="text-center">Cadastro de Usuários</h1>
                ${erro ? `<div class="alert alert-danger" role="alert">Todos os campos são obrigatórios e o formato da data precisa ser válido!</div>` : ''}
                
                <div class="row col-container">
                    <div class="col">
                        <h2>Cadastro de Usuário</h2>
                        <form method="POST" action="/cadastrarUsuario">
                            <div class="mb-3">
                                <label class="form-label">Nome</label>
                                <input type="text" name="nome" class="form-control" value="${nome}">
                                ${mensagensErro.nome ? `<div class="text-danger">${mensagensErro.nome}</div>` : ''}
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Data de Nascimento</label>
                                <input type="date" name="dataNascimento" class="form-control" value="${dataNascimento}">
                                ${mensagensErro.dataNascimento ? `<div class="text-danger">${mensagensErro.dataNascimento}</div>` : ''}
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Apelido</label>
                                <input type="text" name="apelido" class="form-control" value="${apelido}">
                                ${mensagensErro.apelido ? `<div class="text-danger">${mensagensErro.apelido}</div>` : ''}
                            </div>
                            <button type="submit" class="btn btn-primary">Cadastrar</button>
                        </form>
                    </div>

                    <div class="col">
                        <h2>Usuários Cadastrados</h2>
                        <ul class="list-group">
                            ${listaUsuarios}
                        </ul>
                    </div>
                </div>

                <div class="text-center mt-3">
                    <a href="/" class="btn btn-secondary">Voltar ao Menu</a>
                </div>
            </div>
        </body>
        </html>
    `);
});


app.post('/cadastrarUsuario', verificarSessao, (req, res) => {
    const { nome, dataNascimento, apelido } = req.body;

    let erro = false;
    const mensagensErro = {
        nome: '',
        dataNascimento: '',
        apelido: ''
    };

    if (!nome) {
        erro = true;
        mensagensErro.nome = 'O nome é obrigatório!';
    }
    if (!dataNascimento || isNaN(new Date(dataNascimento))) {
        erro = true;
        mensagensErro.dataNascimento = 'A data de nascimento é obrigatória e deve estar no formato correto!';
    }
    if (!apelido) {
        erro = true;
        mensagensErro.apelido = 'O Apelido é obrigatório!';
    }

    if (erro) {
        return res.redirect(`/cadastro?erro=true&nome=${nome}&dataNascimento=${dataNascimento}&apelido=${apelido}&nomeErro=${mensagensErro.nome}&dataNascimentoErro=${mensagensErro.dataNascimento}&apelidoErro=${mensagensErro.apelido}`);
    }

    usuarios.push({ nome, dataNascimento, apelido });
    res.redirect('/cadastro');
});


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
                            ${usuarios.map(u => `<option value="${u.apelido}">${u.nome}</option>`).join('')}
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


app.get('/login.html', (req, res) => {
    res.sendFile(path.join(process.cwd(), './paginas/publica/login.html'));
});


app.post('/login', (req, res) => {
    req.session.loggedIn = true;
    res.cookie('ultimoAcesso', new Date().toLocaleString());
    res.redirect('/');
});


app.get('/logout', (req, res) => {
    req.session.destroy();
    res.clearCookie('ultimoAcesso');
    res.send("Você saiu com sucesso! <a href='/'>Voltar ao Menu</a>");
});


app.listen(porta, () => {
    console.log(`Servidor rodando em http://localhost:${porta}`);
});
