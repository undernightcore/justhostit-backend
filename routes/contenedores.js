var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.statusCode(200)
  res.json({mensaje: "Hola"})
});

module.exports = router;
