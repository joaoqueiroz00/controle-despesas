require('dotenv').config();
const express = require('express');
const handlebars = require('express-handlebars');
const session = require('express-session');
const path = require('path');
const crypto = require('crypto');
const { generateToken } = require('./middlewares/csrf');
const db = require('./config/db_sequelize');
const middlewares = require('./middlewares/middlewares');
const routes = require('./routers/route');
const app = express();
app.engine('handlebars', handlebars.engine({ defaultLayout: 'main', helpers: {
  igual(a, b) { return String(a) === String(b); },
  moeda(v) { return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
}}));
app.set('view engine', 'handlebars');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: process.env.SESSION_SECRET || 'apenas-para-desenvolvimento-troque-isto', resave: false, saveUninitialized: false, cookie: { httpOnly: true, sameSite: 'lax' } }));
app.use((req, res, next) => {res.locals.csrfToken = generateToken(req);next();});
app.use(express.static(path.join(__dirname, 'public')));
app.use(middlewares.logRegister);
app.use(middlewares.sessionControl);
app.use(routes);

app.use((err, req, res, next) => {
  console.error(err);

  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).send(
      'Acesso negado: token de segurança inválido ou ausente.'
    );
  }

  res.status(400).send('Erro na solicitação: ' + err.message);
});

function hashSenha(senha) {
  const salt = crypto.randomBytes(16).toString('hex');
  return salt + ':' + crypto.scryptSync(senha, salt, 64).toString('hex');
}
async function iniciar() {
  await db.sequelize.authenticate();
  await db.sequelize.sync(); // nunca usa force:true
  if (process.env.ADMIN_PASSWORD && process.env.ADMIN_LOGIN) {
    const existe = await db.Usuario.findOne({ where: { login: process.env.ADMIN_LOGIN } });
    if (!existe) await db.Usuario.create({ login: process.env.ADMIN_LOGIN, senha: hashSenha(process.env.ADMIN_PASSWORD), tipo: 2 });
  }
  app.listen(process.env.PORT || 8081, () => console.log('Servidor em http://localhost:' + (process.env.PORT || 8081)));
}
iniciar().catch(erro => { console.error('Falha ao iniciar:', erro); process.exit(1); });
