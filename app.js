const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
require('./config/database');

// Import user routes
const userHomeRoutes = require('./routes/user/home');
const userBlogRoutes = require('./routes/user/blog');
const userEnquiryRoutes = require('./routes/user/enquiry');
const userRoutes = require('./routes/user/user');
const userInstructorRoutes = require('./routes/user/instructor');
const userBannerRoutes = require('./routes/user/banner');
const currentAffairsRoutes = require('./routes/user/currentAffairs');
const userSettingsRoutes = require('./routes/user/settings');
const slidesRoutes = require("./routes/user/banner");
const userProfileRoutes = require("./routes/user/userProfile");

// Import admin routes
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
const adminTermsRoutes = require('./routes/admin/terms');
const userNoticeBoardRoutes = require('./routes/user/noticeBoard');
const userStudentRoutes = require('./routes/user/student');
const adminStudentRoutes = require('./routes/admin/studentManagement');
const adminSettingRoutes = require('./routes/admin/setting');

// Import chat routes
const userChatRoutes = require('./routes/user/chat'); // <-- Add this line

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads/gallery', express.static(path.join(__dirname, 'public/uploads/gallery')));
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization', 'auth_key'] }));
app.options('*', cors());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json({limit:'10mb'}));
app.use(express.urlencoded({limit:'10mb', extended: false }));
app.use(cookieParser());
app.get('/health', (req, res) => res.sendStatus(200));
app.get('/', (req, res) => res.send('Welcome to Pudhuyugam LMS Backend API'));

//  User routes
app.use('/api', userHomeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', userSettingsRoutes);                 
app.use('/api/blogs', userBlogRoutes);          
app.use('/api/contact-enquiry', userEnquiryRoutes);   
app.use('/api/instructors', userInstructorRoutes);
app.use('/api/banners', userBannerRoutes); 
app.use('/api/student', userStudentRoutes);
app.use('/api/user-profile', userProfileRoutes);
app.use('/api/current-affairs', currentAffairsRoutes);
app.use('/api/slides', slidesRoutes);



//  Admin routes
app.use('/api/admin/announcements', adminAnnouncementRoutes);
app.use('/api/admin/banners',adminBannerRoutes);
app.use('/api/admin/blogs', adminBlogRoutes);
app.use('/api/admin/coupons', adminCouponRoutes);
app.use('/api/admin/courses', adminCourseRoutes);
app.use('/api/admin/course-content', adminCourseContentRoutes);
app.use('/api/admin/course-pricing', adminCoursePricingRoutes);
app.use('/api/admin/current-affairs', adminCurrentAffairsRoutes);
app.use('/api/admin/enquiries', adminEnquiryRoutes);
app.use('/api/admin/faculties', adminFacultyRoutes);
app.use('/api/admin/gallery', adminGalleryRoutes);
app.use('/api/admin/legal', adminTermsRoutes);
app.use('/api/notice-board', userNoticeBoardRoutes); 
app.use('/api/admin/students', adminStudentRoutes);
app.use('/api/admin/settings', adminSettingRoutes);

// Chat routes (should be after other routes)
app.use('/api/chat', userChatRoutes); // <-- Add this line

//  Error routes
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

module.exports = app;
