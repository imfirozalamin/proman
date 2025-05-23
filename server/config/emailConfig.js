import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_PeMXH4FA_HRTXqBdaJEUb1NZbfK14fTt1');

// For testing mode configuration
const VERIFIED_EMAIL = 'adityamadhabborah@gmail.com';

export const sendVerificationEmail = async (email, otp) => {
  try {
    // Always send to verified email in testing mode
    const emailConfig = {
      from: 'onboarding@resend.dev',
      to: VERIFIED_EMAIL, // Always send to verified email
      reply_to: email, // Store the intended recipient's email
      subject: 'Email Verification - Proman',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          ${email !== VERIFIED_EMAIL ? 
            `<p style="color: #ff4444; background: #ffe6e6; padding: 10px; border-radius: 5px;">
              <strong>Testing Mode Notice:</strong><br>
              Original recipient: ${email}<br>
              This email was sent to you as the verified sender for testing purposes.
            </p>` 
            : ''
          }
          <p>Thank you for registering with Proman. Please use the following OTP to verify your email address:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; margin: 20px 0;">
            <h1 style="color: #4a90e2; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
          <p style="color: #666; font-size: 12px;">This is an automated email, please do not reply.</p>
        </div>
      `
    };

    const { data, error } = await resend.emails.send(emailConfig);

    if (error) {
      console.error('Email sending failed:', error);
      return false;
    }

    console.log('Email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
}; 