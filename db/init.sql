DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS test_folders CASCADE;
DROP TABLE IF EXISTS tests CASCADE;
DROP TABLE IF EXISTS test_questions CASCADE;
DROP TABLE IF EXISTS test_options CASCADE;
DROP TABLE IF EXISTS test_attempts CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS banners CASCADE;
DROP TABLE IF EXISTS privacy_policy CASCADE;
DROP TABLE IF EXISTS terms_conditions CASCADE;
DROP TABLE IF EXISTS website_settings CASCADE;
DROP TABLE IF EXISTS faculties CASCADE;
DROP TABLE IF EXISTS gallery_items CASCADE;
DROP TABLE IF EXISTS blogs;
DROP TABLE IF EXISTS announcements;

-- Create banners table
CREATE TABLE banners (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_path VARCHAR(255),
    link VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Active',
    sort_order INTEGER,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- Create privacy policy table
CREATE TABLE privacy_policy (
    id SERIAL PRIMARY KEY,
    content TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create terms and conditions table
CREATE TABLE terms_conditions (
    id SERIAL PRIMARY KEY,
    content TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create website settings table
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
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(64),
    phone_number VARCHAR(20) UNIQUE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'student', 'instructor')),
    otp VARCHAR(6),
    otp_expires TIMESTAMP WITH TIME ZONE,
    auth_key VARCHAR(128),
    auth_key_expires TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create courses table
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create enrollments table
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id),
    course_id INTEGER REFERENCES courses(id),
    enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
    UNIQUE(student_id, course_id)
);

-- Create students table
CREATE TABLE students (
    id VARCHAR(10) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    enrollment_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
    about TEXT,
    education JSONB,
    profile_picture VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_name ON students(first_name);
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);

-- Test Management Tables

-- Create test folders table
CREATE TABLE test_folders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id INTEGER REFERENCES test_folders(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create tests table
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create test questions table
CREATE TABLE test_questions (
    id SERIAL PRIMARY KEY,
    test_id INTEGER REFERENCES tests(id) ON DELETE CASCADE,
    question_english TEXT NOT NULL,
    question_tamil TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create test options table
CREATE TABLE test_options (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES test_questions(id) ON DELETE CASCADE,
    option_english TEXT NOT NULL,
    option_tamil TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create test attempts table
CREATE TABLE test_attempts (
    id SERIAL PRIMARY KEY,
    test_id INTEGER REFERENCES tests(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    score INTEGER CHECK (score >= 0 AND score <= 100),
    passed BOOLEAN DEFAULT false,
    answers JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for test management
CREATE INDEX idx_test_folders_parent ON test_folders(parent_id);
CREATE INDEX idx_tests_folder ON tests(folder_id);
CREATE INDEX idx_test_questions_test ON test_questions(test_id);
CREATE INDEX idx_test_options_question ON test_options(question_id);
CREATE INDEX idx_test_attempts_test ON test_attempts(test_id);
CREATE INDEX idx_test_attempts_user ON test_attempts(user_id);

-- Table for gallery
CREATE TABLE gallery_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  type TEXT DEFAULT 'event',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create faculty table
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
    joining_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE blogs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  author TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  image_url TEXT,
  tags TEXT[], -- Array of tags
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

