const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hotel API Documentation',
      version: '1.0.0',
      description: 'API documentation for Hotel-Api',
    },
    tags: [
      {
        name: 'Hotel',
        description: 'Hotel endpoints',
      },
      {
        name: 'Room',
        description: 'Room endpoints',
      },
      {
        name: 'Booking',
        description: 'Booking endpoints',
      },
    ],
  },
  apis: ['./swaggerDocs/**/*.yaml'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
