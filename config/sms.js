require('dotenv').config(); // Load env vars at the very top if not already done

const twilio = require('twilio');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken  = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

/**
 * Send OTP via Twilio SMS
 * @param {string} phone - Recipient's phone number in E.164 format (e.g., +919xxxxxxxxx)
 * @param {string} otp   - The OTP code to send
 * @returns {Promise}
 */
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
