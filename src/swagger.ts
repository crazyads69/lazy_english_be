// swagger.ts
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Reminder API",
      version: "1.0.0",
      description: "A simple reminder API",
    },
    servers: [
      {
        url: "http://localhost:8000",
        description: "Development server",
      },
    ],
  },
  apis: ["./src/routes/*.ts"], // Path to the API docs
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
