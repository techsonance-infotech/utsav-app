import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
const SMTP_SECURE = process.env.SMTP_SECURE === "true"; // usually true for 465, false for 587
const EMAIL_USER = process.env.EMAIL_USER || "";
const EMAIL_PASS = process.env.EMAIL_PASS || "";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@techsonance.co.in";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn("WARNING: SMTP credentials (EMAIL_USER/EMAIL_PASS) are missing! Email sending will be simulated.");
    return { id: "simulated_id" };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Utsav" <${EMAIL_USER}>`,
      to,
      subject,
      html,
      replyTo: ADMIN_EMAIL,
    });

    return { id: info.messageId };
  } catch (error) {
    console.error("Failed to send email via SMTP (nodemailer):", error);
    throw error;
  }
}

export function getVerificationEmailTemplate(name: string, token: string, email: string, siteUrl: string) {
  const verifyUrl = `${siteUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

  return `
    <div style="font-family: 'Outfit', 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #fff8f4; border: 1px solid #dbc2ad; border-radius: 24px; color: #1e1b18;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; padding: 12px; background: #8c5000; border-radius: 16px;">
          <span style="color: #ffffff; font-size: 24px; font-weight: bold; letter-spacing: 1px;">UTSAV</span>
        </div>
        <h2 style="color: #8c5000; margin-top: 24px; font-size: 26px; font-weight: 700;">Verify Your Email Address</h2>
        <p style="color: #554334; font-size: 14px; margin-top: 4px;">Welcome to the Digital Celebration Platform</p>
      </div>
      
      <div style="background-color: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #efe7e1; box-shadow: 0 4px 10px rgba(140, 80, 0, 0.02);">
        <p style="color: #1e1b18; font-size: 16px; line-height: 1.6; margin-top: 0;">Hello ${name},</p>
        <p style="color: #554334; font-size: 16px; line-height: 1.6;">Thank you for registering on Utsav! To activate your account and start your <strong>14-day free trial</strong>, please verify your email address by entering the code below or clicking the button:</p>
        
        <div style="background-color: #faf2ed; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; border: 1px dashed #dbc2ad;">
          <p style="color: #887361; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 10px 0;">Your Verification Code</p>
          <span style="font-size: 38px; font-weight: 800; color: #8c5000; letter-spacing: 6px; font-family: monospace;">${token}</span>
        </div>

        <div style="text-align: center; margin: 24px 0;">
          <a href="${verifyUrl}" style="background-color: #8c5000; color: #ffffff; padding: 16px 36px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 8px 16px rgba(140, 80, 0, 0.25); transition: background-color 0.2s;">
            Verify Email & Start Trial
          </a>
        </div>

        <div style="background-color: #faf2ed; border-left: 4px solid #ff9500; padding: 16px; border-radius: 8px; margin-bottom: 12px;">
          <p style="color: #643700; font-size: 14px; font-weight: 600; margin: 0;">
            🎁 Trial Activated: Your account includes full premium features free for 14 days. No credit card required.
          </p>
        </div>
        
        <p style="color: #887361; font-size: 13px; line-height: 1.6; margin-top: 24px;">If you didn't create an account, you can safely ignore this email.</p>
      </div>
      
      <hr style="border: 0; border-top: 1px solid #dbc2ad; margin: 32px 0;">
      
      <p style="color: #887361; font-size: 12px; text-align: center; line-height: 1.5;">
        &copy; ${new Date().getFullYear()} Utsav Digital Platforms. All rights reserved.<br>
        This is an automated security message, please do not reply.
      </p>
    </div>
  `;
}

export function getConfirmationEmailTemplate(name: string, loginUrl: string) {
  return `
    <div style="font-family: 'Outfit', 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #fff8f4; border: 1px solid #dbc2ad; border-radius: 24px; color: #1e1b18;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; padding: 12px; background: #22c55e; border-radius: 16px;">
          <span style="color: #ffffff; font-size: 24px; font-weight: bold;">✓</span>
        </div>
        <h2 style="color: #1e1b18; margin-top: 24px; font-size: 26px; font-weight: 700;">Account Verified!</h2>
        <p style="color: #554334; font-size: 14px; margin-top: 4px;">Welcome to Utsav Premium</p>
      </div>
      
      <div style="background-color: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #efe7e1; box-shadow: 0 4px 10px rgba(140, 80, 0, 0.02);">
        <p style="color: #1e1b18; font-size: 16px; line-height: 1.6; margin-top: 0;">Hello ${name},</p>
        <p style="color: #554334; font-size: 16px; line-height: 1.6;">Your email address has been successfully verified! Your 14-day trial has started. You can now log in to set up your organization or mandal and manage festivals.</p>
        
        <div style="text-align: center; margin: 36px 0;">
          <a href="${loginUrl}" style="background-color: #8c5000; color: #ffffff; padding: 16px 36px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 8px 16px rgba(140, 80, 0, 0.25);">
            Go to Login
          </a>
        </div>
      </div>
      
      <hr style="border: 0; border-top: 1px solid #dbc2ad; margin: 32px 0;">
      
      <p style="color: #887361; font-size: 12px; text-align: center; line-height: 1.5;">
        &copy; ${new Date().getFullYear()} Utsav Digital Platforms. All rights reserved.
      </p>
    </div>
  `;
}

export function getOtpEmailTemplate(otp: string) {
  return `
    <div style="font-family: 'Outfit', 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #fff8f4; border: 1px solid #dbc2ad; border-radius: 24px; color: #1e1b18;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; padding: 12px; background: #8c5000; border-radius: 16px;">
          <span style="color: #ffffff; font-size: 24px; font-weight: bold;">🔑</span>
        </div>
        <h2 style="color: #8c5000; margin-top: 24px; font-size: 26px; font-weight: 700;">Password Reset Request</h2>
        <p style="color: #554334; font-size: 14px; margin-top: 4px;">Utsav Security</p>
      </div>
      
      <div style="background-color: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #efe7e1; box-shadow: 0 4px 10px rgba(140, 80, 0, 0.02);">
        <p style="color: #1e1b18; font-size: 16px; line-height: 1.6; margin-top: 0;">Hello,</p>
        <p style="color: #554334; font-size: 16px; line-height: 1.6;">We received a request to reset the password for your Utsav account. Use the following One-Time Password (OTP) to proceed:</p>
        
        <div style="background-color: #faf2ed; border-radius: 12px; padding: 24px; text-align: center; margin: 32px 0; border: 1px dashed #dbc2ad;">
          <p style="color: #887361; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px 0;">Your Verification OTP</p>
          <span style="font-size: 40px; font-weight: 800; color: #8c5000; letter-spacing: 8px; font-family: monospace;">${otp}</span>
        </div>

        <div style="background-color: #fffbfa; border-left: 4px solid #ba1a1a; padding: 12px; border-radius: 6px;">
          <p style="color: #93000a; font-size: 13px; font-weight: 600; margin: 0;">
            ⏰ Security warning: This OTP is valid for 10 minutes. Do not share this code with anyone.
          </p>
        </div>
      </div>
      
      <hr style="border: 0; border-top: 1px solid #dbc2ad; margin: 32px 0;">
      
      <p style="color: #887361; font-size: 12px; text-align: center; line-height: 1.5;">
        &copy; ${new Date().getFullYear()} Utsav Digital Platforms. All rights reserved.
      </p>
    </div>
  `;
}

export function getResetSuccessEmailTemplate(name: string, loginUrl: string) {
  return `
    <div style="font-family: 'Outfit', 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #fff8f4; border: 1px solid #dbc2ad; border-radius: 24px; color: #1e1b18;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; padding: 12px; background: #22c55e; border-radius: 16px;">
          <span style="color: #ffffff; font-size: 24px; font-weight: bold;">✓</span>
        </div>
        <h2 style="color: #1e1b18; margin-top: 24px; font-size: 26px; font-weight: 700;">Password Updated!</h2>
        <p style="color: #554334; font-size: 14px; margin-top: 4px;">Security Confirmation</p>
      </div>
      
      <div style="background-color: #ffffff; padding: 32px; border-radius: 16px; border: 1px solid #efe7e1; box-shadow: 0 4px 10px rgba(140, 80, 0, 0.02);">
        <p style="color: #1e1b18; font-size: 16px; line-height: 1.6; margin-top: 0;">Hello ${name},</p>
        <p style="color: #554334; font-size: 16px; line-height: 1.6;">Your account password has been successfully updated. You can now log in to Utsav using your new password.</p>
        
        <div style="text-align: center; margin: 36px 0;">
          <a href="${loginUrl}" style="background-color: #8c5000; color: #ffffff; padding: 16px 36px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 8px 16px rgba(140, 80, 0, 0.25);">
            Login to Your Account
          </a>
        </div>
        
        <p style="color: #887361; font-size: 13px; line-height: 1.6; margin-top: 24px;">If you did not make this change, please contact our support team immediately.</p>
      </div>
      
      <hr style="border: 0; border-top: 1px solid #dbc2ad; margin: 32px 0;">
      
      <p style="color: #887361; font-size: 12px; text-align: center; line-height: 1.5;">
        &copy; ${new Date().getFullYear()} Utsav Digital Platforms. All rights reserved.
      </p>
    </div>
  `;
}
