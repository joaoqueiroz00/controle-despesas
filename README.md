# Minhas Finanças — Programação Web 2

Projeto Node.js / Express / MVC, com PostgreSQL, Sequelize, Handlebars, Bootstrap 4, sessões, middlewares e Multer. Tema adaptado do sistema de receitas culinárias utilizado em aula.

## Pré-requisitos
- Node.js 20+ e NPM
- PostgreSQL instalado e em execução

## Instalação (Windows / PowerShell)
1. Crie no PostgreSQL um banco vazio chamado `controle_despesas` (por exemplo, pelo pgAdmin).
2. Copie `.env.example` para `.env` e edite `DB_USER`, `DB_PASSWORD`, `SESSION_SECRET`, `ADMIN_LOGIN` e `ADMIN_PASSWORD`.
3. No terminal da pasta do projeto, execute `npm install`.
4. Execute `npm start`.
5. Abra `http://localhost:8081`.
6. Entre com `ADMIN_LOGIN` e `ADMIN_PASSWORD` configurados no `.env`.
7. Cadastre pelo menos uma categoria e, se desejar, usuários comuns. Em seguida, cadastre lançamentos.

O Sequelize cria as tabelas automaticamente (`sync()` sem `force:true`). O administrador inicial é criado somente se o login configurado ainda não existir.

## Funcionalidades
- Administrador: CRUD de usuários e categorias; acesso às próprias finanças.
- Usuário comum: login/logout, resumo e CRUD dos próprios lançamentos.
- Listagem com busca por descrição, filtro por tipo, ordenação e paginação (5 por página).
- Imagem JPG/PNG de até 2 MB por lançamento, armazenada em `public/uploads`.
- Senhas armazenadas com `scrypt` do Node.js e salt aleatório; nunca em texto puro.

## Estrutura
- `app.js`: servidor, sessão, Handlebars e inicialização.
- `config/`: conexão Sequelize.
- `models/relational/`: entidades e relacionamentos 1:N.
- `controllers/`: regras e CRUD.
- `routers/route.js`: rotas e proteções.
- `middlewares/`: logging, controle de sessão, autorização e upload.
- `views/`: páginas e layouts Handlebars.
- `public/`: CSS e imagens enviadas.

## Testes manuais sugeridos
1. Tentar abrir `/home` sem login: deve redirecionar para `/`.
2. Entrar como administrador e cadastrar categoria e usuário comum.
3. Entrar como usuário comum: menu de usuários não deve aparecer; `/usuarioList` deve retornar 403.
4. Cadastrar receitas e despesas, com e sem imagem; editar e excluir.
5. Criar 6 lançamentos e verificar paginação, filtros e ordenação.
6. Encerrar a sessão em **Sair** e verificar que `/home` está bloqueado.

## Limitações e observações
- É um projeto acadêmico para execução local, não homologado para produção.
- `express-session` usa o armazenamento padrão em memória, adequado apenas para demonstração local.
- As imagens ficam em `public/uploads` e são acessíveis por URL pública: **não envie comprovantes reais contendo dados pessoais**. Para uso real, seria necessário armazenamento privado e uma rota autenticada de download.
- As operações de criação, edição, exclusão e logout utilizam proteção CSRF. As exclusões e o logout são realizados por requisições POST.
- O arquivo `.env` e `node_modules` não acompanham o ZIP. Não divulgue suas senhas.
- Confirme com a professora que o tema financeiro pode substituir o tema culinário do enunciado.
