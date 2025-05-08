const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.render('layout', { 
    title: 'Puthuyugham',
    content: 'index'
  });
});

module.exports = router;
