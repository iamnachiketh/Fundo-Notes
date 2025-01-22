import amqp from "amqplib";
import { logger } from "../logger";
import { log } from "console";


export const connectToRabbitMQ = async function () {
    try {

        const connection = await amqp.connect('amqp://localhost');

        const channel = await connection.createChannel();

        logger.info("Connected to RabbitMQ");

        const sendToExchange = async function (exchange: string, routingKey: string, message: string) {

            try {

                channel.assertExchange(exchange, 'direct', { durable: true });

                channel.assertQueue("rabbit", { durable: true });

                channel.bindQueue("rabbit", exchange, routingKey);

                channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)));

                logger.info(`Sent message to exchange ${exchange} with routing key ${routingKey}`);
            } catch (error: any) {

                logger.error(`Error in sending message to exchange: ${error.message}`);

            }


        }

    } catch (error: any) {
        logger.error(`Error in connecting to RabbitMQ: ${error.message}`);
    }

}