var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');

// Initialize database connection
require('./config/database');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var testsRouter = require('./routes/tests');
var studentsRouter = require('./routes/students');
var settingsRouter = require('./routes/settings');
var termsRouter = require('./routes/termsConditions');
var bannersRouter = require('./routes/banners');
var facultyRouter = require('./routes/faculty');
var blogsRouter = require("./routes/blogs");
var announcementsRouter = require('./routes/announcements.js');
var currentAffairs = require('./routes/currentAffairs.js');
var courseRouter = require('./routes/course.js');
var coursePricingRouter = require('./routes/coursePricingPlans');
var courseContentRouter = require('./routes/courseContent');





var app = express();

app.use(cors({
  origin: '*', // Be careful with this in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'auth_key']
}));

// Add explicit handling for OPTIONS requests
app.options('*', cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/tests', testsRouter);
app.use('/api/students', studentsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/legal', termsRouter);
app.use('/api/banners', bannersRouter);
app.use('/api/faculties', facultyRouter);
app.use("/api/blogs",blogsRouter);
app.use('/api/announcements',announcementsRouter);
app.use("/api/current-affairs",currentAffairs);
app.use('/api/courses',courseRouter);
app.use('/api/course-content', courseContentRouter);
app.use('/api/course-pricing', coursePricingRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.locals.title = 'Error'; // Add title for error page
  res.locals.content = 'error'; // Specify the content template

  // render the error page
  res.status(err.status || 500);
  res.render('layout');
});

module.exports = app;