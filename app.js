const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');


require('./config/database');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const testsRouter = require('./routes/tests');
const studentsRouter = require('./routes/students');
const settingsRouter = require('./routes/settings');
const termsRouter = require('./routes/termsConditions');
const bannersRouter = require('./routes/banners');
const facultyRouter = require('./routes/faculty');
const blogsRouter = require("./routes/blogs");
const announcementsRouter = require('./routes/announcements.js');
const currentAffairs = require('./routes/currentAffairs.js');
const courseRouter = require('./routes/course.js');
const coursePricingRouter = require('./routes/coursePricingPlans');
const courseContentRouter = require('./routes/courseContent');
const couponsRouter = require('./routes/coupons.js');
const enquiryRoutes = require('./routes/enquiry');
const studentManagementRouter = require("./routes/studentManagement.js");
const galleryRouter = require('./routes/gallery');
const noticeBoardRouter = require('./routes/noticeBoard.js');
const blogsUserRouter = require('./routes/blogUser.js');

// user routes
const slideRouter = require('./routes/slide.js');



const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'auth_key']
}));

app.options('*', cors());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads/gallery', express.static(path.join(__dirname, 'public/uploads/gallery')));


app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/tests', testsRouter);
app.use('/api/students', studentsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/legal', termsRouter);
app.use('/api/banners', bannersRouter);
app.use('/api/faculty', facultyRouter);
app.use("/api/blogs", blogsRouter);
app.use('/api/announcements', announcementsRouter);
app.use("/api/current-affairs", currentAffairs);
app.use('/api/courses', courseRouter);
app.use('/api/course-content', courseContentRouter);
app.use('/api/course-pricing', coursePricingRouter);
app.use('/api/coupons', couponsRouter);
app.use('/api/contact-enquiry', enquiryRoutes);
app.use('/api/student-management', studentManagementRouter);
app.use('/api/gallery', galleryRouter);
// users
app.use("/api/slides",slideRouter);
app.use("/api/notice-board",noticeBoardRouter);
app.use('/api/user-blogs', blogsUserRouter);

app.get('/health', (req, res) => res.sendStatus(200));
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.locals.title = 'Error'; 
  res.locals.content = 'error';

  res.status(err.status || 500);
  res.render('layout');
});

module.exports = app;