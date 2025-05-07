const express = require('express');
const morgan = require('morgan');
const path = require('path');

const app = express();


app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the LMS Backend API' });
});


app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API is working!' });
});


app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`LMS Backend running on port ${PORT}`);
});
