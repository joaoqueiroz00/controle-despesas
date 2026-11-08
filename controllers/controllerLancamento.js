
const { Op } = require('sequelize');
const db = require('../config/db_sequelize');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const fsPromises = require('fs/promises');

async function salvarImagem(file) {
  if (!file) return null;

  
const assinaturaPNG = Buffer.from([
  0x89, 0x50, 0x4E, 0x47,
  0x0D, 0x0A, 0x1A, 0x0A
]);

const ehPNG =
  file.mimetype === 'image/png' &&
  file.buffer.subarray(0, 8).equals(assinaturaPNG);

const ehJPG =
  file.mimetype === 'image/jpeg' &&
  file.buffer.length >= 3 &&
  file.buffer[0] === 0xFF &&
  file.buffer[1] === 0xD8 &&
  file.buffer[2] === 0xFF;

if (!ehPNG && !ehJPG) {
  throw new Error('Arquivo inválido. Envie uma imagem JPG ou PNG válida.');
}


  const extensao = file.mimetype === 'image/png' ? '.png' : '.jpg';
  const nomeArquivo = crypto.randomUUID() + extensao;

  const caminho = path.join(
    __dirname,
    '../public/uploads',
    nomeArquivo
  );

  await fsPromises.writeFile(caminho, file.buffer, { flag: 'wx' });

  return nomeArquivo;
}

function limparArquivo(file) {
  if (file) {
    fs.unlink(
      path.join(__dirname, '../public/uploads', file),
      () => {}
    );
  }
}

function dadosForm(req) {
  const valor = Number(req.body.valor);

  if (
    !req.body.descricao?.trim() ||
    !['despesa', 'receita'].includes(req.body.tipo) ||
    !Number.isFinite(valor) ||
    valor <= 0 ||
    !req.body.data ||
    !req.body.categoriaId
  ) {
    throw new Error('Preencha corretamente os dados do lançamento.');
  }

  return {
    descricao: req.body.descricao.trim(),
    tipo: req.body.tipo,
    valor,
    data: req.body.data,
    categoriaId: Number(req.body.categoriaId)
  };
}

async function categoriasJSON() {
  return (
    await db.Categoria.findAll({
      order: [['nome', 'ASC']]
    })
  ).map(c => c.toJSON());
}

module.exports = {

  async getCreate(req, res, next) {
    try {
      res.render('lancamento/form', {
        titulo: 'Novo lançamento',
        action: '/lancamentoCreate',
        categorias: await categoriasJSON()
      });
    } catch (erro) {
      next(erro);
    }
  },

  async postCreate(req, res, next) {
    let nomeImagem = null;

    try {
      const dados = dadosForm(req);

      if (!await db.Categoria.findByPk(dados.categoriaId)) {
        throw new Error('Categoria inválida.');
      }

      nomeImagem = await salvarImagem(req.file);

      await db.Lancamento.create({
        ...dados,
        usuarioId: req.session.usuarioId,
        imagem: nomeImagem
      });

      res.redirect('/lancamentoList');

    } catch (erro) {
      limparArquivo(nomeImagem);
      next(erro);
    }
  },

  async getList(req, res, next) {
    try {
      const pagina = Math.max(
        1,
        parseInt(req.query.pagina, 10) || 1
      );

      const limite = 5;

      const filtro = {
        usuarioId: req.session.usuarioId
      };

      if (
        req.query.tipo &&
        ['despesa', 'receita'].includes(req.query.tipo)
      ) {
        filtro.tipo = req.query.tipo;
      }

      if (req.query.busca?.trim()) {
        filtro.descricao = {
          [Op.iLike]: '%' + req.query.busca.trim() + '%'
        };
      }

      const ordem = req.query.ordem === 'valor'
        ? 'valor'
        : 'data';

      const direcao = req.query.direcao === 'ASC'
        ? 'ASC'
        : 'DESC';

      const { rows, count } = await db.Lancamento.findAndCountAll({
        where: filtro,
        include: [
          {
            model: db.Categoria,
            attributes: ['nome']
          }
        ],
        order: [
          [ordem, direcao],
          ['id', 'DESC']
        ],
        limit: limite,
        offset: (pagina - 1) * limite
      });

      const paginas = Math.max(
        1,
        Math.ceil(count / limite)
      );

      const qs = new URLSearchParams({
        tipo: req.query.tipo || '',
        busca: req.query.busca || '',
        ordem,
        direcao
      }).toString();

      res.render('lancamento/list', {
        lancamentos: rows.map(l => l.toJSON()),
        tipo: req.query.tipo,
        busca: req.query.busca,
        ordem,
        direcao,
        total: count,
        pagina,
        anterior: pagina > 1
          ? '/lancamentoList?' + qs + '&pagina=' + (pagina - 1)
          : null,
        proxima: pagina < paginas
          ? '/lancamentoList?' + qs + '&pagina=' + (pagina + 1)
          : null
      });

    } catch (erro) {
      next(erro);
    }
  },

  async getUpdate(req, res, next) {
    try {
      const lancamento = await db.Lancamento.findOne({
        where: {
          id: req.params.id,
          usuarioId: req.session.usuarioId
        }
      });

      if (!lancamento) {
        return res.sendStatus(404);
      }

      res.render('lancamento/form', {
        titulo: 'Editar lançamento',
        action: '/lancamentoUpdate',
        lancamento: lancamento.toJSON(),
        categorias: await categoriasJSON()
      });

    } catch (erro) {
      next(erro);
    }
  },

  
async postUpdate(req, res, next) {
  let nomeImagem = null;

  try {
    const antigo = await db.Lancamento.findOne({
      where: {
        id: req.body.id,
        usuarioId: req.session.usuarioId
      }
    });

    if (!antigo) {
      return res.sendStatus(404);
    }

    const dados = dadosForm(req);

    if (!await db.Categoria.findByPk(dados.categoriaId)) {
      throw new Error('Categoria inválida.');
    }

    const imagemAntiga = antigo.imagem;

    if (req.file) {
      nomeImagem = await salvarImagem(req.file);
      dados.imagem = nomeImagem;
    }

    await antigo.update(dados);

    if (nomeImagem && imagemAntiga) {
      limparArquivo(imagemAntiga);
    }

    res.redirect('/lancamentoList');

  } catch (erro) {
    limparArquivo(nomeImagem);
    next(erro);
  }
},


  async getDelete(req, res, next) {
    try {
      const lancamento = await db.Lancamento.findOne({
        where: {
          id: req.params.id,
          usuarioId: req.session.usuarioId
        }
      });

      if (!lancamento) {
        return res.sendStatus(404);
      }

      await lancamento.destroy();

      limparArquivo(lancamento.imagem);

      res.redirect('/lancamentoList');

    } catch (erro) {
      next(erro);
    }
  },

  async getHome(req, res, next) {
    try {
      const itens = await db.Lancamento.findAll({
        where: {
          usuarioId: req.session.usuarioId
        },
        attributes: ['tipo', 'valor']
      });

      let receitas = 0;
      let despesas = 0;

      for (const item of itens) {
        if (item.tipo === 'receita') {
          receitas += Number(item.valor);
        } else {
          despesas += Number(item.valor);
        }
      }

      res.render('home', {
        receitas,
        despesas,
        saldo: receitas - despesas
      });

    } catch (erro) {
      next(erro);
    }
  }

};
