const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'your-email@gmail.com', 
        pass: 'your-email-password', 
    },
});


const sendEmail = async (to, subject, text) => {
    try {
        const mailOptions = {
            from: 'your-email@gmail.com', 
            to, 
            subject, 
            text, 
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
    } catch (err) {
        console.error('Error sending email:', err);
    }
};

module.exports = sendEmail;
