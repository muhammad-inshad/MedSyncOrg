import { transporter } from "../utils/otp/mail.util.ts";
export class EmailService {
    async sendOtpEmail(to, otp) {
        const mailOptions = {
            from: `"MedSync" <${process.env.MAIL_USER}>`,
            to,
            subject: "Your MedSync Verification Code",
            html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #2563eb;">MedSync Verification</h2>
          <p>Your One-Time Password (OTP) is:</p>
          <h1 style="letter-spacing: 5px; color: #1e40af;">${otp}</h1>
          <p>This code expires in 5 minutes.</p>
          <hr style="border: none; border-top: 1px solid #eee;" />
          <small>If you didn't request this, please ignore this email.</small>
        </div>
      `,
        };
        return await transporter.sendMail(mailOptions);
    }
}
