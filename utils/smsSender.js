// smsSender.js

const twilio = require("twilio");

// Replace these with your actual credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

/**
 * Sends an SMS message using Twilio.
 * @param {string} to - The recipient's phone number (e.g., +1234567890).
 * @param {string} message - The message to send.
 * @returns {Promise<void>}
 */
async function sendSMS(to, message) {
  try {
    const response = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to,
    });
    console.log(`Message sent successfully: ${response.sid}`);
  } catch (error) {
    console.error(`Failed to send message: ${error.message}`);
  }
}

module.exports = sendSMS;
