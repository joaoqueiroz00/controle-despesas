module.exports = (sequelize, Sequelize) => sequelize.define('lancamento', {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  descricao: { type: Sequelize.STRING, allowNull: false },
  tipo: { type: Sequelize.ENUM('despesa', 'receita'), allowNull: false },
  valor: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
  data: { type: Sequelize.DATEONLY, allowNull: false },
  imagem: { type: Sequelize.STRING, allowNull: true },
  categoriaId: { type: Sequelize.INTEGER, allowNull: false },
  usuarioId: { type: Sequelize.INTEGER, allowNull: false }
});
