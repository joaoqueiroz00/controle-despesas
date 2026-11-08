const crypto = require('crypto');
const db = require('../config/db_sequelize');
function hashSenha(senha) {
  const salt = crypto.randomBytes(16).toString('hex');
  return salt + ':' + crypto.scryptSync(senha, salt, 64).toString('hex');
}
function senhaValida(senha, armazenada) {
  try {
    const [salt, hash] = armazenada.split(':');
    const calculada = crypto.scryptSync(senha, salt, 64);
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), calculada);
  } catch (_) { return false; }
}
module.exports = {
  getLogin(req, res) { if (req.session?.usuarioId) return res.redirect('/home'); res.render('usuario/login', { layout: 'noMenu' }); },
  async postLogin(req, res, next) {
    try {
      const usuario = await db.Usuario.findOne({ where: { login: req.body.login || '' } });
      if (!usuario || !senhaValida(req.body.senha || '', usuario.senha)) return res.status(401).render('usuario/login', { layout: 'noMenu', erro: 'Login ou senha inválidos.' });
      req.session.regenerate(erro => {
        if (erro) return next(erro);
        req.session.usuarioId = usuario.id;
        req.session.login = usuario.login;
        req.session.tipo = usuario.tipo;
        res.redirect('/home');
      });
    } catch (erro) { next(erro); }
  },
  getLogout(req, res, next) { req.session.destroy(erro => erro ? next(erro) : res.redirect('/')); },
  getCreate(req, res) { res.render('usuario/form', { titulo: 'Cadastrar usuário', action: '/usuarioCreate' }); },
  async postCreate(req, res, next) {
    try {
      if (!req.body.login?.trim() || !req.body.senha) return res.status(400).send('Login e senha são obrigatórios.');
      await db.Usuario.create({ login: req.body.login.trim(), senha: hashSenha(req.body.senha), tipo: Number(req.body.tipo) === 2 ? 2 : 1 });
      res.redirect('/usuarioList');
    } catch (erro) { next(erro); }
  },
  async getList(req, res, next) {
    try { const usuarios = await db.Usuario.findAll({ attributes: ['id', 'login', 'tipo'], order: [['id', 'ASC']] }); res.render('usuario/list', { usuarios: usuarios.map(u => u.toJSON()) }); } catch (erro) { next(erro); }
  },
  async getUpdate(req, res, next) {
    try { const usuario = await db.Usuario.findByPk(req.params.id); if (!usuario) return res.sendStatus(404); res.render('usuario/form', { titulo: 'Editar usuário', action: '/usuarioUpdate', usuario: usuario.toJSON() }); } catch (erro) { next(erro); }
  },
  async postUpdate(req, res, next) {
    try {
      const dados = {
  login: req.body.login,
  tipo: Number(req.body.tipo) === 2 ? 2 : 1
};

const usuarioAtual = await db.Usuario.findByPk(req.body.id);

if (!usuarioAtual) {
  return res.status(404).send('Usuário não encontrado.');
}

if (usuarioAtual.tipo === 2 && dados.tipo !== 2) {
  const totalAdmins = await db.Usuario.count({
    where: { tipo: 2 }
  });

  if (totalAdmins <= 1) {
    return res.status(400).send(
      'Não é possível remover o perfil do último administrador.'
    );
  }
}
      if (req.body.senha) dados.senha = hashSenha(req.body.senha);
      await db.Usuario.update(dados, { where: { id: req.body.id } });
      res.redirect('/usuarioList');
    } catch (erro) { next(erro); }
  },
  async getDelete(req, res, next) {
    try {
      if (Number(req.params.id) === req.session.usuarioId) return res.status(400).send('Não é possível excluir o próprio usuário.');
      await db.Usuario.destroy({ where: { id: req.params.id } }); res.redirect('/usuarioList');
    } catch (erro) { next(erro); }
  }
};
