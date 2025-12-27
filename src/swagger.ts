import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Collaborative Workspace API',
      version: '1.0.0',
      description: 'Backend API for collaborative workspaces and projects'
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Local server'
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
  apis: ['src/modules/**/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
