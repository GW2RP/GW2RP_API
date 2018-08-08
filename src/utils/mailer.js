const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_SECURE,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

function sendMail(options) {
    return new Promise((resolve, reject) => {
        transporter.sendMail(options, (error, info) => {
            if (error) {
                console.error(error);
                return reject(error);
            }
            console.info('Mail sent.');
            return resolve();
        });
    });
}

module.exports = {
    sendMail
};