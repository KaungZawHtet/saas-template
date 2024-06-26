import * as dotenv from 'dotenv';
const formData = require('form-data');
const Mailgun = require('mailgun.js');

const mailgun = new Mailgun(formData);

dotenv.config();

const mg = mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY || 'abc' });
export const confirmEmail = async (email: string, confirmationToken: string) => {
  await mg.messages
    .create(process.env.MAILGUN_EMAIL, {
      from: `Excited User <mailgun@${process.env.MAILGUN_DOMAIN}>`,
      to: [email],
      subject: 'Email confirmation',
      text: `Please confirm your email by clicking on the following link: \nhttp://${process.env.BASE_URL}/email-confirm?token=${confirmationToken}`,
    })
    .then((msg) => console.log(msg)) // logs response data
    .catch((err) => console.log(err)); // logs any error
};
