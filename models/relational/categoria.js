module.exports = (sequelize, Sequelize) => sequelize.define('categoria', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: Sequelize.STRING, allowNull: false, unique: true }
});
