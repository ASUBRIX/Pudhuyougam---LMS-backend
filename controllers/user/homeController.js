// Render the EJS home page
const renderHome = (req, res) => {
  res.render('layout', { 
    title: 'Puthuyugham',
    content: 'index'
  });
};

module.exports = { renderHome };
