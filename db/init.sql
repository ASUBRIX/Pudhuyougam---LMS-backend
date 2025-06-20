SET client_min_messages TO warning;

DROP TABLE IF EXISTS test_options CASCADE;
DROP TABLE IF EXISTS test_questions CASCADE;
DROP TABLE IF EXISTS test_attempts CASCADE;
DROP TABLE IF EXISTS tests CASCADE;
DROP TABLE IF EXISTS test_folders CASCADE;

DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS user_otps CASCADE;

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
DROP TABLE IF EXISTS chat_messages CASCADE;

DROP SEQUENCE IF EXISTS enrollment_id_seq CASCADE;

CREATE SEQUENCE enrollment_id_seq START 1;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$ language 'plpgsql';

CREATE TABLE banners (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  link VARCHAR(255),
  status VARCHAR(50) DEFAULT 'Active',
  sort_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE privacy_policy (
  id SERIAL PRIMARY KEY,
  content TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE terms_conditions (
  id SERIAL PRIMARY KEY,
  content TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20),
  enrollment_date DATE NOT NULL,
  program VARCHAR(100),
  semester VARCHAR(50),
  year VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
  courses TEXT[],
  profile_picture TEXT,
  enrollment_id VARCHAR(20) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_otps (
    phone_number VARCHAR(20) PRIMARY KEY,
    otp VARCHAR(6),
    otp_expires TIMESTAMP
);

INSERT INTO users (first_name, last_name, email, password_hash, role, created_at)
VALUES (
  'Admin',
  'User',
  'admin@pudhuyugamacademy.com',
  'admin@1234',
  'admin',
  NOW()
)
ON CONFLICT (email) DO NOTHING;

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

CREATE TABLE enrollments (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES users(id),
  course_id INTEGER REFERENCES courses(id),
  enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
  UNIQUE(student_id, course_id)
);

CREATE TABLE course_categories (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE course_subcategories (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES course_categories(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE course_modules (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  sort_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE course_faqs (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE course_content_modules (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  contents JSONB DEFAULT '[]',
  video_modules JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE course_content_folders (
  id SERIAL PRIMARY KEY,
  module_id INTEGER REFERENCES course_content_modules(id) ON DELETE CASCADE,
  parent_id INTEGER REFERENCES course_content_folders(id),
  title VARCHAR(255) NOT NULL,
  is_free BOOLEAN DEFAULT FALSE,
  sort_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE gallery_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  type TEXT DEFAULT 'event',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE faculties (
  id SERIAL PRIMARY KEY,
  faculty_id VARCHAR(20) UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  department VARCHAR(100),
  designation VARCHAR(100),
  status VARCHAR(20),
  qualification VARCHAR(255),
  experience VARCHAR(100),
  avatar TEXT,
  bio TEXT,
  joining_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  board_member BOOLEAN DEFAULT FALSE
);

CREATE TABLE blogs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL CHECK (LENGTH(TRIM(title)) > 0),
  date TEXT NOT NULL,
  author VARCHAR(100) NOT NULL CHECK (LENGTH(TRIM(author)) > 0),
  excerpt TEXT CHECK (LENGTH(TRIM(excerpt)) > 0),
  content TEXT NOT NULL CHECK (LENGTH(TRIM(content)) > 0),
  image_url TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}' CHECK (array_length(tags, 1) > 0),
  is_published BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  sender VARCHAR(20) NOT NULL CHECK (sender IN ('admin', 'student')),
  text TEXT,
  type VARCHAR(20) DEFAULT 'text',      
  file_type VARCHAR(20),
  file_size VARCHAR(20),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_phone ON students(phone);
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_enrollment_id ON students(enrollment_id);
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_test_folders_parent ON test_folders(parent_id);
CREATE INDEX idx_tests_folder ON tests(folder_id);
CREATE INDEX idx_test_questions_test ON test_questions(test_id);
CREATE INDEX idx_test_options_question ON test_options(question_id);
CREATE INDEX idx_test_attempts_test ON test_attempts(test_id);
CREATE INDEX idx_test_attempts_user ON test_attempts(user_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_sender ON chat_messages(sender);

CREATE INDEX idx_blogs_is_published ON blogs(is_published);
CREATE INDEX idx_blogs_created_at ON blogs(created_at DESC);
CREATE INDEX idx_blogs_author ON blogs(author);
CREATE INDEX idx_blogs_tags ON blogs USING GIN(tags);
CREATE INDEX idx_blogs_title_search ON blogs USING GIN(to_tsvector('english', title));
CREATE INDEX idx_blogs_content_search ON blogs USING GIN(to_tsvector('english', content));
CREATE INDEX idx_blogs_published_created ON blogs(is_published, created_at DESC);

CREATE TRIGGER update_blogs_updated_at
    BEFORE UPDATE ON blogs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_pricing_plans_updated_at
    BEFORE UPDATE ON course_pricing_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_content_modules_updated_at
    BEFORE UPDATE ON course_content_modules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_folders_updated_at
    BEFORE UPDATE ON test_folders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tests_updated_at
    BEFORE UPDATE ON tests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_questions_updated_at
    BEFORE UPDATE ON test_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_options_updated_at
    BEFORE UPDATE ON test_options
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_attempts_updated_at
    BEFORE UPDATE ON test_attempts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faculties_updated_at
    BEFORE UPDATE ON faculties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at
    BEFORE UPDATE ON announcements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_current_affairs_updated_at
    BEFORE UPDATE ON current_affairs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enquiries_updated_at
    BEFORE UPDATE ON enquiries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at
    BEFORE UPDATE ON coupons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banners_updated_at
    BEFORE UPDATE ON banners
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_privacy_policy_updated_at
    BEFORE UPDATE ON privacy_policy
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_terms_conditions_updated_at
    BEFORE UPDATE ON terms_conditions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_website_settings_updated_at
    BEFORE UPDATE ON website_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();