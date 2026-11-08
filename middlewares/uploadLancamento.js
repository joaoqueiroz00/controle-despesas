const multer = require('multer');

const storage = multer.memoryStorage();

module.exports = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024
  },
  fileFilter(req, file, cb) {
    if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
      return cb(new Error('Envie JPG ou PNG.'));
    }

    cb(null, true);
  }
});
