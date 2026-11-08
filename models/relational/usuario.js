module.exports = (sequelize, Sequelize) => sequelize.define('usuario', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  login: { type: Sequelize.STRING, allowNull: false, unique: true },
  senha: { type: Sequelize.STRING, allowNull: false },
  tipo: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 }
});
