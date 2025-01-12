"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerJSDoc = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const package_json_1 = require("../../package.json");
const logger_1 = require("../logger");
const options = {
    definition: {
        openapi: "3.1.0",
        info: {
            title: "Fundo Notes REST API Docs",
            version: package_json_1.version,
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ["C:\\Users\\NACHIKETHA\\Documents\\All_About_js\\Fundo-Notes\\src\\routes\\*.ts"],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
const swaggerJSDoc = function (app, port) {
    app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
    app.get("docs.json", function (req, res) {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });
    logger_1.logger.info(`Docs available at http://localhost:${port}/docs`);
};
exports.swaggerJSDoc = swaggerJSDoc;
