const db = require('../config/db_sequelize');
module.exports = {
  getCreate(req, res) { res.render('categoria/form', { titulo: 'Cadastrar categoria', action: '/categoriaCreate' }); },
  async postCreate(req, res, next) { try { await db.Categoria.create({ nome: req.body.nome }); res.redirect('/categoriaList'); } catch (erro) { next(erro); } },
  async getList(req, res, next) { try { const categorias = await db.Categoria.findAll({ order: [['nome', 'ASC']] }); res.render('categoria/list', { categorias: categorias.map(c => c.toJSON()) }); } catch (erro) { next(erro); } },
  async getUpdate(req, res, next) { try { const categoria = await db.Categoria.findByPk(req.params.id); if (!categoria) return res.sendStatus(404); res.render('categoria/form', { titulo: 'Editar categoria', action: '/categoriaUpdate', categoria: categoria.toJSON() }); } catch (erro) { next(erro); } },
  async postUpdate(req, res, next) { try { await db.Categoria.update({ nome: req.body.nome }, { where: { id: req.body.id } }); res.redirect('/categoriaList'); } catch (erro) { next(erro); } },
  async getDelete(req, res, next) { try { await db.Categoria.destroy({ where: { id: req.params.id } }); res.redirect('/categoriaList'); } catch (erro) { next(erro); } }
};
