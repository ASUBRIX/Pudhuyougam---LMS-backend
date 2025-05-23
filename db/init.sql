-- ============================
-- DROP TABLES (in dependency order)
-- ============================
DROP TABLE IF EXISTS test_options CASCADE;
DROP TABLE IF EXISTS test_questions CASCADE;
DROP TABLE IF EXISTS test_attempts CASCADE;
DROP TABLE IF EXISTS tests CASCADE;
DROP TABLE IF EXISTS test_folders CASCADE;

DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TABLE IF EXISTS course_contents CASCADE;
DROP TABLE IF EXISTS course_content_folders CASCADE;
DROP TABLE IF EXISTS course_content_modules CASCADE;
DROP TABLE IF EXISTS course_lessons CASCADE;
DROP TABLE IF EXISTS course_modules CASCADE;
DROP TABLE IF EXISTS course_faqs CASCADE;
DROP TABLE IF EXISTS course_pricing_plans CASCADE;
DROP TABLE IF EXISTS course_subcategories CASCADE;
DROP TABLE IF EXISTS course_categories CASCADE;
DROP TABLE IF EXISTS courses CASCADE;

DROP TABLE IF EXISTS banners CASCADE;
DROP TABLE IF EXISTS privacy_policy CASCADE;
DROP TABLE IF EXISTS terms_conditions CASCADE;
DROP TABLE IF EXISTS website_settings CASCADE;
DROP TABLE IF EXISTS faculties CASCADE;
DROP TABLE IF EXISTS gallery_items CASCADE;

DROP TABLE IF EXISTS blogs CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS current_affairs CASCADE;
DROP TABLE IF EXISTS enquiries CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;

-- =====================
-- CREATE TABLES
-- =====================

-- Banners
CREATE TABLE banners (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  link VARCHAR(255),
  status VARCHAR(50) DEFAULT 'Active',
  sort_order INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Privacy Policy
CREATE TABLE privacy_policy (
  id SERIAL PRIMARY KEY,
  content TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Terms and Conditions
CREATE TABLE terms_conditions (
  id SERIAL PRIMARY KEY,
  content TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Website Settings
CREATE TABLE website_settings (
  id SERIAL PRIMARY KEY,
  site_name VARCHAR(255),
  site_title VARCHAR(255),
  site_description TEXT,
  site_email VARCHAR(255),
  site_phone VARCHAR(50),
  site_address TEXT,
  site_logo VARCHAR(255),
  site_favicon VARCHAR(255),
  copyright_text TEXT,
  facebook_url VARCHAR(255),
  youtube_url VARCHAR(255),
  telegram_url VARCHAR(255),
  instagram_url VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(64),
  phone_number VARCHAR(20) UNIQUE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'student', 'instructor')),
  otp VARCHAR(6),
  otp_expires TIMESTAMP,
  auth_key VARCHAR(128),
  auth_key_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20),
  enrollment_date DATE NOT NULL,
  program VARCHAR(100),
  semester VARCHAR(50),
  year VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active',
  courses TEXT[],  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  short_description TEXT,
  full_description TEXT,
  thumbnail VARCHAR(255),
  promo_video_url TEXT,
  price NUMERIC(10,2) DEFAULT 0.00,
  discount NUMERIC(5,2) DEFAULT 0.00,
  is_discount_enabled BOOLEAN DEFAULT FALSE,
  validity_type VARCHAR(20) CHECK (validity_type IN ('single', 'multi', 'lifetime', 'expiry')) DEFAULT 'single',
  expiry_date DATE,
  language VARCHAR(50),
  level VARCHAR(50),
  is_featured BOOLEAN DEFAULT FALSE,
  total_lectures INTEGER DEFAULT 0,
  total_duration VARCHAR(50),
  instructor_id INTEGER REFERENCES users(id),
  tags TEXT[],
  message_to_reviewer TEXT,
  review_status VARCHAR(20) DEFAULT 'pending',
  visibility_status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enrollments
CREATE TABLE enrollments (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES users(id),
  course_id INTEGER REFERENCES courses(id),
  enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
  UNIQUE(student_id, course_id)
);

-- Course Categories
CREATE TABLE course_categories (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course Subcategories
CREATE TABLE course_subcategories (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES course_categories(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course Modules
CREATE TABLE course_modules (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  sort_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course Lessons
CREATE TABLE course_lessons (
  id SERIAL PRIMARY KEY,
  module_id INTEGER REFERENCES course_modules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content_type VARCHAR(20) CHECK (content_type IN ('video', 'document', 'image', 'archive', 'link')),
  video_url TEXT,
  file_path TEXT,
  is_free BOOLEAN DEFAULT FALSE,
  sort_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course FAQs
CREATE TABLE course_faqs (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course Pricing Plans
CREATE TABLE course_pricing_plans (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  duration INTEGER,
  unit VARCHAR(10) CHECK (unit IN ('days', 'months', 'years')),
  price NUMERIC(10,2),
  discount NUMERIC(5,2),
  is_promoted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course Content Modules
CREATE TABLE course_content_modules (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  contents JSONB DEFAULT '[]',
  video_modules JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course Content Folders
CREATE TABLE course_content_folders (
  id SERIAL PRIMARY KEY,
  module_id INTEGER REFERENCES course_content_modules(id) ON DELETE CASCADE,
  parent_id INTEGER REFERENCES course_content_folders(id),
  title VARCHAR(255) NOT NULL,
  is_free BOOLEAN DEFAULT FALSE,
  sort_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course Contents
CREATE TABLE course_contents (
  id SERIAL PRIMARY KEY,
  folder_id INTEGER REFERENCES course_content_folders(id) ON DELETE CASCADE,
  type VARCHAR(20) CHECK (type IN ('video', 'document', 'image', 'archive', 'link')),
  title VARCHAR(255) NOT NULL,
  file_path TEXT,
  video_url TEXT,
  is_free BOOLEAN DEFAULT FALSE,
  sort_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test Management
CREATE TABLE test_folders (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  parent_id INTEGER REFERENCES test_folders(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tests (
  id SERIAL PRIMARY KEY,
  folder_id INTEGER REFERENCES test_folders(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  passing_score INTEGER CHECK (passing_score >= 0 AND passing_score <= 100),
  duration_minutes INTEGER CHECK (duration_minutes > 0),
  instructions TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  shuffle_questions BOOLEAN DEFAULT false,
  show_results_immediately BOOLEAN DEFAULT true,
  allow_answer_review BOOLEAN DEFAULT true,
  enable_time_limit BOOLEAN DEFAULT true,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE test_questions (
  id SERIAL PRIMARY KEY,
  test_id INTEGER REFERENCES tests(id) ON DELETE CASCADE,
  question_english TEXT NOT NULL,
  question_tamil TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE test_options (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES test_questions(id) ON DELETE CASCADE,
  option_english TEXT NOT NULL,
  option_tamil TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE test_attempts (
  id SERIAL PRIMARY KEY,
  test_id INTEGER REFERENCES tests(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  score INTEGER CHECK (score >= 0 AND score <= 100),
  passed BOOLEAN DEFAULT false,
  answers JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_test_folders_parent ON test_folders(parent_id);
CREATE INDEX idx_tests_folder ON tests(folder_id);
CREATE INDEX idx_test_questions_test ON test_questions(test_id);
CREATE INDEX idx_test_options_question ON test_options(question_id);
CREATE INDEX idx_test_attempts_test ON test_attempts(test_id);
CREATE INDEX idx_test_attempts_user ON test_attempts(user_id);

-- Gallery Items
CREATE TABLE gallery_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  type TEXT DEFAULT 'event',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE faculties (
  id SERIAL PRIMARY KEY,
  faculty_id VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  department VARCHAR(100),
  designation VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
  qualification TEXT,
  experience TEXT,
  avatar TEXT,
  bio TEXT,  -- <--- Add this line
  joining_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Blogs
CREATE TABLE blogs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  author TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  image_url TEXT,
  tags TEXT[],
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Announcements
CREATE TABLE announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Current Affairs
CREATE TABLE current_affairs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100),
  date DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enquiries
CREATE TABLE enquiries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Coupons
CREATE TABLE coupons (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  discount_type VARCHAR(20) NOT NULL, 
  discount_value NUMERIC NOT NULL,
  max_usage INTEGER,
  expiry_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);