const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Pudhuyugam LMS API Documentation',
      version: '1.0.0',
      description: `
        ## Pudhuyugam LMS API
        
        ### Authentication
        Most endpoints require authentication. Include your auth token in the header:
        \`auth_key: <your-auth-token>\`
        
        ### Base URLs
        - **User APIs**: \`/api\`
        - **Admin APIs**: \`/api/admin\`
      `,
      contact: {
        name: 'Tony Kuriakose',
        email: 'tony@asubrix.com',
        phone: '+91-9961618585'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://server.pudhuyugamacademy.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        authKey: {
          type: 'apiKey',
          in: 'header',
          name: 'auth_key',
          description: 'Authentication key for accessing protected endpoints'
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Unauthorized access' },
                  error: { type: 'string', example: 'UNAUTHORIZED' }
                }
              }
            }
          }
        },
        ValidationError: {
          description: 'Input validation failed',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Validation failed' },
                  errors: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        field: { type: 'string', example: 'email' },
                        message: { type: 'string', example: 'Email is required' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Resource not found' },
                  error: { type: 'string', example: 'NOT_FOUND' }
                }
              }
            }
          }
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Internal server error' },
                  error: { type: 'string', example: 'SERVER_ERROR' }
                }
              }
            }
          }
        }
      },
      parameters: {
        PageParam: {
          name: 'page',
          in: 'query',
          description: 'Page number for pagination',
          schema: { type: 'integer', minimum: 1, default: 1 }
        },
        LimitParam: {
          name: 'limit',
          in: 'query',
          description: 'Number of items per page',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 }
        },
        SearchParam: {
          name: 'search',
          in: 'query',
          description: 'Search term',
          schema: { type: 'string' }
        },
        SortParam: {
          name: 'sort',
          in: 'query',
          description: 'Sort field and order (e.g., "name:asc" or "createdAt:desc")',
          schema: { type: 'string', example: 'created_at:desc' }
        }
      },
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation completed successfully' }
          }
        },
        PaginationInfo: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            total: { type: 'integer', example: 100 },
            pages: { type: 'integer', example: 10 },
            hasNext: { type: 'boolean', example: true },
            hasPrev: { type: 'boolean', example: false }
          }
        },

        // ============================
        // USER & AUTHENTICATION SCHEMAS
        // ============================
        User: {
          type: 'object',
          required: ['first_name', 'last_name', 'role'],
          properties: {
            id: { type: 'integer', example: 1 },
            first_name: { type: 'string', maxLength: 50, example: 'John' },
            last_name: { type: 'string', maxLength: 50, example: 'Doe' },
            email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
            phone_number: { type: 'string', maxLength: 20, example: '+919876543210' },
            role: { type: 'string', enum: ['admin', 'student', 'instructor'], example: 'student' },
            otp: { type: 'string', maxLength: 6, example: '123456' },
            otp_expires: { type: 'string', format: 'date-time' },
            auth_key: { type: 'string', maxLength: 128 },
            auth_key_expires: { type: 'string', format: 'date-time' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },

        UserRegistration: {
          type: 'object',
          required: ['first_name', 'last_name', 'email', 'password', 'role'],
          properties: {
            first_name: { type: 'string', maxLength: 50, example: 'John' },
            last_name: { type: 'string', maxLength: 50, example: 'Doe' },
            email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
            password: { type: 'string', minLength: 6, example: 'securePassword123' },
            phone_number: { type: 'string', maxLength: 20, example: '+919876543210' },
            role: { type: 'string', enum: ['student', 'instructor'], example: 'student' }
          }
        },

        UserLogin: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
            password: { type: 'string', example: 'securePassword123' }
          }
        },

        Student: {
          type: 'object',
          required: ['first_name', 'last_name', 'email', 'enrollment_date'],
          properties: {
            id: { type: 'integer', example: 1 },
            user_id: { type: 'integer', example: 5 },
            first_name: { type: 'string', maxLength: 50, example: 'John' },
            last_name: { type: 'string', maxLength: 50, example: 'Doe' },
            email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
            phone: { type: 'string', maxLength: 20, example: '+919876543210' },
            enrollment_date: { type: 'string', format: 'date', example: '2023-01-15' },
            program: { type: 'string', maxLength: 100, example: 'Computer Science' },
            semester: { type: 'string', maxLength: 50, example: 'Fall 2023' },
            year: { type: 'string', maxLength: 50, example: '2023' },
            status: { type: 'string', default: 'active', example: 'active' },
            courses: { type: 'array', items: { type: 'string' }, example: ['MATH101', 'CS101'] },
            profile_picture: { type: 'string', example: 'https://example.com/profiles/john_doe.jpg' },
            enrollment_id: { type: 'string', maxLength: 20, example: 'STU001' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },

        // ============================
        // COURSE SCHEMAS
        // ============================
        Course: {
          type: 'object',
          required: ['title'],
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', maxLength: 255, example: 'Introduction to Machine Learning' },
            short_description: { type: 'string', example: 'Learn the fundamentals of ML' },
            full_description: { type: 'string', example: 'Complete course covering all aspects...' },
            thumbnail: { type: 'string', example: 'https://example.com/thumbnails/ml_course.jpg' },
            promo_video_url: { type: 'string', example: 'https://youtube.com/watch?v=xyz123' },
            price: { type: 'number', format: 'decimal', minimum: 0, example: 99.99 },
            discount: { type: 'number', format: 'decimal', minimum: 0, maximum: 100, example: 10.00 },
            is_discount_enabled: { type: 'boolean', default: false },
            validity_type: { type: 'string', enum: ['single', 'multi', 'lifetime', 'expiry'], default: 'single' },
            expiry_date: { type: 'string', format: 'date', example: '2024-12-31' },
            language: { type: 'string', maxLength: 50, example: 'English' },
            level: { type: 'string', maxLength: 50, example: 'Beginner' },
            is_featured: { type: 'boolean', default: false },
            total_lectures: { type: 'integer', minimum: 0, default: 0 },
            total_duration: { type: 'string', maxLength: 50, example: '20 hours' },
            instructor_id: { type: 'integer' },
            tags: { type: 'array', items: { type: 'string' }, example: ['machine-learning', 'ai', 'python'] },
            review_status: { type: 'string', default: 'pending', example: 'approved' },
            visibility_status: { type: 'string', default: 'draft', example: 'published' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },

        CourseCategory: {
          type: 'object',
          required: ['title'],
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', maxLength: 255, example: 'Technology' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },

        Enrollment: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            student_id: { type: 'integer', example: 5 },
            course_id: { type: 'integer', example: 3 },
            enrollment_date: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['active', 'completed', 'dropped'], default: 'active' }
          }
        },

        // ============================
        // CONTENT SCHEMAS
        // ============================
        Blog: {
          type: 'object',
          required: ['title', 'date', 'author', 'content', 'tags'],
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', maxLength: 255, example: 'The Future of Online Learning' },
            date: { type: 'string', example: '2023-12-15' },
            author: { type: 'string', maxLength: 100, example: 'Dr. Sarah Johnson' },
            excerpt: { type: 'string', example: 'Exploring how technology is reshaping education...' },
            content: { type: 'string', example: 'In today\'s digital age, online learning has become...' },
            image_url: { type: 'string', example: 'https://example.com/blog/future-learning.jpg' },
            tags: { type: 'array', items: { type: 'string' }, minItems: 1, example: ['education', 'technology'] },
            is_published: { type: 'boolean', default: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },

        CurrentAffairs: {
          type: 'object',
          required: ['title', 'content'],
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', maxLength: 255, example: 'New Education Policy Updates' },
            content: { type: 'string', example: 'Recent changes in the national education policy...' },
            category: { type: 'string', maxLength: 100, example: 'Education' },
            date: { type: 'string', format: 'date', example: '2023-12-15' },
            is_active: { type: 'boolean', default: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },

        Banner: {
          type: 'object',
          required: ['title'],
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', maxLength: 255, example: 'Special Offer - 50% Off All Courses' },
            description: { type: 'string', example: 'Limited time offer for new students' },
            image_url: { type: 'string', example: 'https://example.com/banners/special-offer.jpg' },
            link: { type: 'string', example: 'https://example.com/courses' },
            status: { type: 'string', default: 'Active', example: 'Active' },
            sort_order: { type: 'integer', example: 1 },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },

        // ============================
        // TEST SCHEMAS
        // ============================
        Test: {
          type: 'object',
          required: ['title'],
          properties: {
            id: { type: 'integer', example: 1 },
            folder_id: { type: 'integer', nullable: true, example: 1 },
            title: { type: 'string', maxLength: 255, example: 'Calculus Fundamentals Test' },
            description: { type: 'string', example: 'Test covering basic calculus concepts' },
            category: { type: 'string', maxLength: 100, example: 'Mathematics' },
            passing_score: { type: 'integer', minimum: 0, maximum: 100, example: 70 },
            duration_minutes: { type: 'integer', minimum: 1, example: 60 },
            instructions: { type: 'string', example: 'Read each question carefully...' },
            status: { type: 'string', enum: ['draft', 'published', 'archived'], default: 'draft' },
            shuffle_questions: { type: 'boolean', default: false },
            show_results_immediately: { type: 'boolean', default: true },
            is_free: { type: 'boolean', default: false },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },

        TestQuestion: {
          type: 'object',
          required: ['test_id', 'question_english', 'question_tamil'],
          properties: {
            id: { type: 'integer', example: 1 },
            test_id: { type: 'integer', example: 1 },
            question_english: { type: 'string', example: 'What is the derivative of x²?' },
            question_tamil: { type: 'string', example: 'x² இன் வகைக்கெழு என்ன?' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },

        TestOption: {
          type: 'object',
          required: ['question_id', 'option_english', 'option_tamil', 'is_correct'],
          properties: {
            id: { type: 'integer', example: 1 },
            question_id: { type: 'integer', example: 1 },
            option_english: { type: 'string', example: '2x' },
            option_tamil: { type: 'string', example: '2x' },
            is_correct: { type: 'boolean', example: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },

        // ============================
        // FACULTY & COMMUNICATION
        // ============================
        Faculty: {
          type: 'object',
          required: ['name'],
          properties: {
            id: { type: 'integer', example: 1 },
            faculty_id: { type: 'string', maxLength: 20, example: 'FAC001' },
            name: { type: 'string', maxLength: 255, example: 'Dr. Jane Smith' },
            email: { type: 'string', format: 'email', example: 'jane.smith@pudhuyugam.com' },
            phone: { type: 'string', maxLength: 20, example: '+919876543210' },
            department: { type: 'string', maxLength: 100, example: 'Computer Science' },
            designation: { type: 'string', maxLength: 100, example: 'Professor' },
            qualification: { type: 'string', maxLength: 255, example: 'Ph.D. in Computer Science' },
            experience: { type: 'string', maxLength: 100, example: '15 years' },
            avatar: { type: 'string', example: 'https://example.com/faculty/jane_smith.jpg' },
            bio: { type: 'string', example: 'Dr. Smith specializes in machine learning...' },
            joining_date: { type: 'string', format: 'date', example: '2020-08-15' },
            board_member: { type: 'boolean', default: false },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },

        Enquiry: {
          type: 'object',
          required: ['name', 'message'],
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', maxLength: 100, example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
            phone: { type: 'string', maxLength: 20, example: '+919876543210' },
            subject: { type: 'string', maxLength: 255, example: 'Course Enquiry' },
            message: { type: 'string', example: 'I would like to know more about your ML course...' },
            is_resolved: { type: 'boolean', default: false },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },

        ChatMessage: {
          type: 'object',
          required: ['user_id', 'sender'],
          properties: {
            id: { type: 'integer', example: 1 },
            user_id: { type: 'integer', example: 5 },
            sender: { type: 'string', enum: ['admin', 'student'], example: 'student' },
            text: { type: 'string', nullable: true, example: 'Hello, I need help with my assignment' },
            type: { type: 'string', default: 'text', example: 'text' },
            file_type: { type: 'string', maxLength: 20, nullable: true, example: 'pdf' },
            file_size: { type: 'string', maxLength: 20, nullable: true, example: '2.5MB' },
            timestamp: { type: 'string', format: 'date-time' }
          }
        },

        Coupon: {
          type: 'object',
          required: ['code', 'discount_type', 'discount_value'],
          properties: {
            id: { type: 'integer', example: 1 },
            code: { type: 'string', maxLength: 50, example: 'SAVE50' },
            discount_type: { type: 'string', maxLength: 20, example: 'percentage' },
            discount_value: { type: 'number', example: 50.00 },
            max_usage: { type: 'integer', nullable: true, example: 100 },
            expiry_date: { type: 'string', format: 'date', nullable: true, example: '2024-12-31' },
            is_active: { type: 'boolean', default: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    security: [
      { bearerAuth: [] },
      { authKey: [] }
    ],
    tags: [
      { name: 'General', description: 'General API information' },
      { name: 'Authentication', description: 'User and admin authentication' },
      { name: 'Users', description: 'User management operations' },
      { name: 'Students', description: 'Student profile and management' },
      { name: 'Courses', description: 'Course management and content' },
      { name: 'Blogs', description: 'Blog content management' },
      { name: 'Current Affairs', description: 'Current affairs content' },
      { name: 'Banners', description: 'Banner and slide management' },
      { name: 'Gallery', description: 'Media gallery management' },
      { name: 'Enquiries', description: 'Contact enquiry handling' },
      { name: 'Chat', description: 'Chat and messaging functionality' },
      { name: 'Faculty', description: 'Faculty management' },
      { name: 'Tests', description: 'Test and assessment management' },
      { name: 'Settings', description: 'Application settings' },
      { name: 'Admin - Authentication', description: 'Admin authentication' },
      { name: 'Admin - Users', description: 'Admin user management' },
      { name: 'Admin - Courses', description: 'Admin course management' },
      { name: 'Admin - Content', description: 'Admin content management' }
    ]
  },
  apis: [
    './routes/user/*.js',
    './routes/admin/*.js', 
    './models/*.js',
    './routes/user/banner.js',
    './routes/user/blog.js',
    './routes/user/chat.js',
    './routes/user/currentAffairs.js',
    './routes/user/enquiry.js',
    './routes/user/home.js',
    './routes/user/instructor.js',
    './routes/user/legal.js',
    './routes/user/noticeBoard.js',
    './routes/user/settings.js',
    './routes/user/student.js',
    './routes/user/test.js',
    './routes/user/user.js',
    './routes/user/userProfile.js',

  //  Admin Routes
  './routes/admin/admin.js',
  './routes/admin/announcement.js',
  './routes/admin/banner.js',
  './routes/admin/blog.js',
  './routes/admin/coupon.js',
  './routes/admin/course.js',
  './routes/admin/courseContent.js',
  './routes/admin/coursePricing.js',
  './routes/admin/currentAffairs.js',
  './routes/admin/enquiry.js',
  './routes/admin/faculty.js',
  './routes/admin/gallery.js',
  './routes/admin/privacy.js',
  './routes/admin/setting.js.js',
  './routes/admin/studentManagement.js',
  './routes/admin/terms.js',
  './routes/admin/test.js'
    ]
};

const specs = swaggerJsdoc(options);

module.exports = {
  specs,
  swaggerUi
};


