const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');


const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Pudhuyugam LMS API',
      version: '1.0.0',
      description: 'Learning Management System API Documentation',
      contact: {
        name: 'API Support',
        email: 'support@pudhuyugamlms.com'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './routes/*.js',
    './routes/**/*.js',
    './models/*.js',
    './controllers/*.js'
  ]
};

const specs = swaggerJsdoc(options);

/**
 * Configure Swagger documentation middleware
 * @param {Express} app - Express application instance
 */
const setupSwagger = (app) => {
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

 
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info .title { color: #2c3e50; font-size: 36px; }
      .swagger-ui .info .description { font-size: 14px; line-height: 1.6; }
      .swagger-ui .scheme-container { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
    `,
    customSiteTitle: 'Pudhuyugam LMS API Documentation',
    swaggerOptions: {
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      tryItOutEnabled: true,
      persistAuthorization: true
    }
  }));

  // API Documentation JSON endpoint
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  // Enhanced root route with API documentation links
  app.get('/', (req, res) => {
    res.send(`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
        <h1 style="color: #2c3e50;">Welcome to Pudhuyugam LMS Backend API</h1>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Quick Links:</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 10px 0;">
              <a href="/api-docs" style="background: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">
                📚 API Documentation
              </a>
            </li>
            <li style="margin: 10px 0;">
              <a href="/health" style="background: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">
                🏥 Health Check
              </a>
            </li>
            <li style="margin: 10px 0;">
              <a href="/api-docs.json" style="background: #6c757d; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">
                📄 OpenAPI JSON
              </a>
            </li>
          </ul>
        </div>
        <p style="color: #6c757d;">
          <strong>Base URLs:</strong><br>
          • User APIs: <code>/api</code><br>
          • Admin APIs: <code>/api/admin</code>
        </p>
      </div>
    `);
  });
};

module.exports = {
  setupSwagger,
  specs,
  swaggerUi
};