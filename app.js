const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const {setupSwagger} = require('./config/swagger');
require('./config/database');

// Import user routes
const userHomeRoutes = require('./routes/user/home');
const userEnquiryRoutes = require('./routes/user/enquiry');
const userRoutes = require('./routes/user/user');
const userStudentRoutes = require('./routes/user/student');
const userChatRoutes = require('./routes/user/chat');
const studentProfileRoutes = require('./routes/user/student');
const userBannerRoutes = require('./routes/user/banner');
const userNoticeBoardRoutes = require('./routes/user/noticeBoard');
const slidesRoutes = require('./routes/user/banner');
const userBlogRoutes = require('./routes/user/blog');
const currentAffairsRoutes = require('./routes/user/currentAffairs');
const userInstructorRoutes = require('./routes/user/instructor');
const userSettingsRoutes = require('./routes/user/settings');
const userLegalRoutes = require('./routes/user/legal');

// Import admin routes
const adminRoutes = require('./routes/admin/admin');
const adminAnnouncementRoutes = require('./routes/admin/announcement');
const adminBannerRoutes = require('./routes/admin/banner');
const adminBlogRoutes = require('./routes/admin/blog');
const adminCouponRoutes = require('./routes/admin/coupon');
const adminCourseRoutes = require('./routes/admin/course');
const adminCourseContentRoutes = require('./routes/admin/courseContent');
const adminCoursePricingRoutes = require('./routes/admin/coursePricing');
const adminCurrentAffairsRoutes = require('./routes/admin/currentAffairs');
const adminEnquiryRoutes = require('./routes/admin/enquiry');
const adminFacultyRoutes = require('./routes/admin/faculty');
const adminGalleryRoutes = require('./routes/admin/gallery');
const adminPrivacyRoutes = require('./routes/admin/privacy');
const adminTermsRoutes = require('./routes/admin/terms');
const adminStudentRoutes = require('./routes/admin/studentManagement');
const adminSettingRoutes = require('./routes/admin/setting');
const adminTestRoutes = require('./routes/admin/test');

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads/gallery', express.static(path.join(__dirname, 'public/uploads/gallery')));

// Middleware
app.use(cors({ 
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization', 'auth_key'] 
}));
app.use(cors({ 
  origin: process.env.NODE_ENV === 'production' ? ['https://server.pudhuyugamacademy.com', 'https://www.server.pudhuyugamacademy.com'] : '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization', 'auth_key'],
  credentials: true
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(morgan('dev', {skip: function (req, res) {return req.path === '/health';}}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: false }));
app.use(cookieParser());


app.get('/health', (req, res) => res.sendStatus(200));
setupSwagger(app);

// User routes
app.use('/api', userHomeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/student/profile', studentProfileRoutes);
app.use('/api/chat', userChatRoutes);
app.use('/api/settings', userSettingsRoutes);
app.use('/api/blogs', userBlogRoutes);
app.use('/api/contact-enquiry', userEnquiryRoutes);
app.use('/api/instructors', userInstructorRoutes);
app.use('/api/banners', userBannerRoutes);
app.use('/api/student', userStudentRoutes);
app.use('/api/current-affairs', currentAffairsRoutes);
app.use('/api/slides', slidesRoutes);
app.use('/api/legal', userLegalRoutes);
app.use('/api/notice-board', userNoticeBoardRoutes);

// Admin routes
app.use('/api/admin/login', adminRoutes);
app.use('/api/admin/announcements', adminAnnouncementRoutes);
app.use('/api/admin/banners', adminBannerRoutes);
app.use('/api/admin/blogs', adminBlogRoutes);
app.use('/api/admin/coupons', adminCouponRoutes);
app.use('/api/admin/courses', adminCourseRoutes);
app.use('/api/admin/course-content', adminCourseContentRoutes);
app.use('/api/admin/course-pricing', adminCoursePricingRoutes);
app.use('/api/admin/current-affairs', adminCurrentAffairsRoutes);
app.use('/api/admin/enquiries', adminEnquiryRoutes);
app.use('/api/admin/faculties', adminFacultyRoutes);
app.use('/api/admin/gallery', adminGalleryRoutes);
app.use('/api/admin/privacy', adminPrivacyRoutes);
app.use('/api/admin/terms', adminTermsRoutes);
app.use('/api/admin/students', adminStudentRoutes);
app.use('/api/admin/settings', adminSettingRoutes);
app.use('/api/admin/test', adminTestRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    message: `The endpoint ${req.method} ${req.path} does not exist`,
    documentation: '/api-docs'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

module.exports = app;