module.exports = {
  logRegister(req, res, next) {
    console.log(req.method + ' ' + req.originalUrl + ' - ' + new Date().toISOString());
    next();
  },
  sessionControl(req, res, next) {
    res.locals.login = req.session?.login || null;
    res.locals.admin = req.session?.tipo === 2;
    if (req.session?.usuarioId) return next();
    if (req.path === '/' && req.method === 'GET') return next();
    if (req.path === '/login' && req.method === 'POST') return next();
    return res.redirect('/');
  },
  somenteAdmin(req, res, next) {
    if (req.session?.tipo !== 2) return res.status(403).send('Acesso negado: somente administrador.');
    next();
  }
};
