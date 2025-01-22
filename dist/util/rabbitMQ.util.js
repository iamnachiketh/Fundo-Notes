"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToRabbitMQ = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
const logger_1 = require("../logger");
const connectToRabbitMQ = function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const connection = yield amqplib_1.default.connect(process.env.RABBITMQ_URL);
            const channel = yield connection.createChannel();
            logger_1.logger.info("Connected to RabbitMQ");
            const sendToExchange = function (exchange, routingKey, emailData) {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        channel.assertExchange(exchange, "direct", { durable: true });
                        channel.assertQueue("rabbit", { durable: true });
                        channel.bindQueue("rabbit", exchange, routingKey);
                        let res = channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(emailData)));
                        logger_1.logger.info(`Sent message to exchange ${exchange} with routing key ${routingKey}`);
                        setTimeout(() => {
                            connection.close();
                        }, 3000);
                    }
                    catch (error) {
                        logger_1.logger.error(`Error in sending message to exchange: ${error.message}`);
                    }
                });
            };
            return {
                sendToExchange
            };
        }
        catch (error) {
            logger_1.logger.error(`Error in connecting to RabbitMQ: ${error.message}`);
        }
    });
};
exports.connectToRabbitMQ = connectToRabbitMQ;
