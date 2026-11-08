
const express = require('express');
const route = express.Router();

const usuario = require('../controllers/controllerUsuario');
const categoria = require('../controllers/controllerCategoria');
const lancamento = require('../controllers/controllerLancamento');

const { somenteAdmin } = require('../middlewares/middlewares');
const upload = require('../middlewares/uploadLancamento');
const { csrfSynchronisedProtection } = require('../middlewares/csrf');

// Login e logout
route.get('/', usuario.getLogin);
route.post('/login', csrfSynchronisedProtection, usuario.postLogin);
route.post('/logout', csrfSynchronisedProtection, usuario.getLogout);

// Página inicial
route.get('/home', lancamento.getHome);

// Usuários
route.get('/usuarioCreate', somenteAdmin, usuario.getCreate);
route.post('/usuarioCreate', somenteAdmin, csrfSynchronisedProtection, usuario.postCreate);

route.get('/usuarioList', somenteAdmin, usuario.getList);

route.get('/usuarioUpdate/:id', somenteAdmin, usuario.getUpdate);
route.post('/usuarioUpdate', somenteAdmin, csrfSynchronisedProtection, usuario.postUpdate);

route.post('/usuarioDelete/:id', somenteAdmin, csrfSynchronisedProtection, usuario.getDelete);
// Categorias
route.get('/categoriaCreate', somenteAdmin, categoria.getCreate);
route.post('/categoriaCreate', somenteAdmin, csrfSynchronisedProtection, categoria.postCreate);

route.get('/categoriaList', categoria.getList);

route.get('/categoriaUpdate/:id', somenteAdmin, categoria.getUpdate);
route.post( '/categoriaUpdate', somenteAdmin, csrfSynchronisedProtection, categoria.postUpdate);

route.post('/categoriaDelete/:id', somenteAdmin, csrfSynchronisedProtection, categoria.getDelete);

// Lançamentos
route.get('/lancamentoCreate', lancamento.getCreate);

route.post(
  '/lancamentoCreate',
  upload.single('imagem'),
  csrfSynchronisedProtection,
  lancamento.postCreate
);

route.get('/lancamentoList', lancamento.getList);

route.get('/lancamentoUpdate/:id', lancamento.getUpdate);

route.post(
  '/lancamentoUpdate',
  upload.single('imagem'),
  csrfSynchronisedProtection,
  lancamento.postUpdate
);

route.post(
  '/lancamentoDelete/:id',
  csrfSynchronisedProtection,
  lancamento.getDelete
);

module.exports = route;
