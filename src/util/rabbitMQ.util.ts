import amqp from "amqplib";
import { logger } from "../logger";


export const connectToRabbitMQ = async function () {
    try {

        const connection = await amqp.connect(process.env.RABBITMQ_URL as string);

        const channel = await connection.createChannel();

        logger.info("Connected to RabbitMQ");

        type EmailData = {
            to:string,
            from:string,
            subject:string,
            body:string
        }

        const sendToExchange = async function (exchange: string, routingKey: string, emailData: EmailData) {

            try {

                channel.assertExchange(exchange, "direct", { durable: true });

                channel.assertQueue("rabbit", { durable: true });

                channel.bindQueue("rabbit", exchange, routingKey);

                let res =  channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(emailData)));

                logger.info(`Sent message to exchange ${exchange} with routing key ${routingKey}`);

                setTimeout(()=>{
                    connection.close();
                }, 3000);

            } catch (error: any) {

                logger.error(`Error in sending message to exchange: ${error.message}`);

            }


        }

        return{
            sendToExchange
        }

    } catch (error: any) {
        logger.error(`Error in connecting to RabbitMQ: ${error.message}`);
    }

}