const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST || 'localhost', dialect: 'postgres', logging: false
});
const db = { Sequelize, sequelize };
db.Usuario = require('../models/relational/usuario')(sequelize, Sequelize);
db.Categoria = require('../models/relational/categoria')(sequelize, Sequelize);
db.Lancamento = require('../models/relational/lancamento')(sequelize, Sequelize);
db.Usuario.hasMany(db.Lancamento, { foreignKey: 'usuarioId', onDelete: 'CASCADE' });
db.Categoria.hasMany(db.Lancamento, { foreignKey: 'categoriaId', onDelete: 'NO ACTION' });
db.Lancamento.belongsTo(db.Usuario, { foreignKey: 'usuarioId' });
db.Lancamento.belongsTo(db.Categoria, { foreignKey: 'categoriaId' });
module.exports = db;
