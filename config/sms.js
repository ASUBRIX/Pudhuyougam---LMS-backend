require('dotenv').config();
const twilio = require('twilio');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken  = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

async function sendOTP(phone, otp) {
  // Only allow sending to verified numbers in Free Trial
  if (!phone.startsWith('+')) {
    throw new Error('Phone number must be in E.164 format, e.g., +91xxxxxxxxxx');
  }
  return client.messages.create({
    body: `Your OTP for Pudhuyugam Academy is: ${otp}`,
    to: phone,
    from: fromNumber,
  });
}

module.exports = { sendOTP };
