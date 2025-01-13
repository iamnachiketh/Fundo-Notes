import nodemailer from "nodemailer";


interface emailOptions {

    recipients: string;
    subject: string;
    message: string;

}


export const sendEmail = async function ({ recipients, subject, message }: emailOptions) {

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.USER_EMAIL,
            pass: process.env.USER_PASSKEY
        }
    });

    const mailOptions = {

        from: process.env.USER_EMAIL,
        to: recipients,
        subject: subject,
        text: message

    }

    try {

        await transporter.sendMail(mailOptions);

    } catch (error) {

        throw new Error(`Error sending email: ${(error as Error).message}`);

    }

}