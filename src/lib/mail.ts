import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { OrderItem } from "./types";

interface SendMailOptions {
  order: OrderItem;
  toEmail?: string;
  hostUrl?: string;
}

export function isSmtpConfigured(): boolean {
  return !!(
    (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) ||
    (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD)
  );
}

function createTransporter() {
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }

  return null;
}

function logEmailToFile(entry: string) {
  try {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const logPath = path.join(dataDir, "emails.log");
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logPath, `[${timestamp}]\n${entry}\n----------------------------------------\n`, "utf8");
  } catch (err) {
    console.error("[Mail] Failed to write to emails.log:", err);
  }
}

export async function sendContactNotificationEmail({ order, toEmail, hostUrl }: SendMailOptions) {
  const adminEmail =
    toEmail ||
    process.env.CONTACT_EMAIL_TO ||
    process.env.SMTP_USER ||
    process.env.GMAIL_USER ||
    "lh.musicstudio.vn@gmail.com";

  const senderFrom =
    process.env.CONTACT_EMAIL_FROM ||
    `"LH Music Studio" <${process.env.SMTP_USER || process.env.GMAIL_USER || "no-reply@lhmusicstudio.vn"}>`;

  const subject = `🔔 [LH Music Studio] Yêu cầu mới: ${order.customerName} - ${order.itemSelected}`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #1e1715; margin: 0; padding: 24px; color: #f5efe4; }
    .container { max-width: 600px; margin: 0 auto; background: #27201c; border: 1px solid #e8dcbe40; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1e1715, #2a201b); padding: 24px; border-bottom: 2px solid #e8dcbe; text-align: center; }
    .logo-text { font-size: 24px; font-weight: 800; color: #e8dcbe; letter-spacing: 2px; margin: 0; }
    .sub-logo { font-size: 12px; color: #b5a597; text-transform: uppercase; margin-top: 4px; }
    .body { padding: 28px; }
    .title { font-size: 20px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 16px; }
    .card { background: #1e1715; border: 1px solid #3d312c; border-radius: 12px; padding: 18px; margin-bottom: 20px; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #332722; font-size: 14px; }
    .row:last-child { border-bottom: none; }
    .label { color: #b5a597; font-weight: 500; }
    .value { color: #f5efe4; font-weight: 600; text-align: right; }
    .highlight { color: #e8dcbe; font-weight: 700; }
    .message-box { background: #1a1412; border-left: 3px solid #e8dcbe; padding: 14px; border-radius: 6px; font-size: 14px; line-height: 1.6; color: #f5efe4; white-space: pre-wrap; }
    .btn { display: inline-block; background: #e8dcbe; color: #1e1715; padding: 12px 24px; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 14px; margin-top: 10px; }
    .footer { text-align: center; font-size: 12px; color: #8c7b70; padding: 20px; border-top: 1px solid #3d312c; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo-text">LH MUSIC STUDIO</h1>
      <div class="sub-logo">Hệ Thống Quản Lý Liên Hệ &amp; Đặt Lịch</div>
    </div>
    <div class="body">
      <h2 class="title">🔔 Có yêu cầu liên hệ mới!</h2>
      <p style="color: #b5a597; font-size: 14px; margin-bottom: 20px;">
        Hệ thống vừa ghi nhận một thông tin đặt lịch / liên hệ từ website của bạn. Chi tiết như sau:
      </p>

      <div class="card">
        <div class="row">
          <span class="label">Mã đơn / Yêu cầu:</span>
          <span class="value font-mono">${order.id}</span>
        </div>
        <div class="row">
          <span class="label">Họ và tên khách:</span>
          <span class="value highlight">${order.customerName}</span>
        </div>
        <div class="row">
          <span class="label">Số điện thoại / Zalo:</span>
          <span class="value"><a href="tel:${order.phone}" style="color: #e8dcbe; text-decoration: none;">${order.phone}</a></span>
        </div>
        ${
          order.email
            ? `<div class="row">
          <span class="label">Email khách:</span>
          <span class="value">${order.email}</span>
        </div>`
            : ""
        }
        <div class="row">
          <span class="label">Loại dịch vụ:</span>
          <span class="value">${order.serviceType}</span>
        </div>
        <div class="row">
          <span class="label">Hạng mục lựa chọn:</span>
          <span class="value highlight">${order.itemSelected}</span>
        </div>
        <div class="row">
          <span class="label">Thời gian gửi:</span>
          <span class="value">${new Date(order.createdAt).toLocaleString("vi-VN")}</span>
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <span class="label" style="display: block; margin-bottom: 6px;">Nội dung chi tiết / Ghi chú:</span>
        <div class="message-box">${order.message || "(Không có lời nhắn bổ sung)"}</div>
      </div>

      <div style="text-align: center; margin-top: 25px;">
        <a href="tel:${order.phone}" class="btn">📞 Gọi Điện Ngay</a>
        ${
          hostUrl
            ? `<a href="${hostUrl}/admin" class="btn" style="background: transparent; border: 1px solid #e8dcbe; color: #e8dcbe; margin-left: 10px;">Mở Trang Quản Trị</a>`
            : ""
        }
      </div>
    </div>
    <div class="footer">
      Email tự động được gửi từ hệ thống website Linh Hồ Drummer &amp; LH Music Studio.<br />
      Địa chỉ: TP. Hồ Chí Minh • Hotline: ${order.phone}
    </div>
  </div>
</body>
</html>
  `.trim();

  const transporter = createTransporter();

  if (!transporter) {
    const logEntry = `[EMAIL NOTIFICATION TO ADMIN]\nTo: ${adminEmail}\nSubject: ${subject}\nCustomer: ${order.customerName} (${order.phone})\nService: ${order.itemSelected}\nNote: SMTP not configured. Logged for development testing.`;
    console.log(`[Mail Simulation] ${logEntry}`);
    logEmailToFile(logEntry);
    return {
      success: true,
      simulated: true,
      message: "Email logged to data/emails.log (SMTP credentials not yet set in .env.local)",
    };
  }

  try {
    const info = await transporter.sendMail({
      from: senderFrom,
      to: adminEmail,
      subject,
      html: htmlContent,
      replyTo: order.email || undefined,
    });

    logEmailToFile(`[SENT LIVE SUCCESS]\nMessageId: ${info.messageId}\nTo: ${adminEmail}\nSubject: ${subject}`);
    console.log(`[Mail] Email sent to ${adminEmail}, messageId: ${info.messageId}`);

    // If customer provided an email address, send a polite confirmation email to customer too!
    if (order.email && order.email.includes("@")) {
      await transporter
        .sendMail({
          from: senderFrom,
          to: order.email,
          subject: `✓ [LH Music Studio] Đã nhận thông tin: ${order.itemSelected}`,
          html: `
            <div style="font-family: sans-serif; background: #1e1715; color: #f5efe4; padding: 24px; border-radius: 12px;">
              <h2 style="color: #e8dcbe;">Chào ${order.customerName},</h2>
              <p>Cảm ơn bạn đã liên hệ với <strong>Linh Hồ Drummer &amp; LH Music Studio</strong>!</p>
              <p>Chúng tôi đã nhận được yêu cầu của bạn về hạng mục: <strong>${order.itemSelected}</strong>.</p>
              <p>Chúng tôi sẽ gọi điện hoặc nhắn tin Zalo qua số <strong>${order.phone}</strong> trong thời gian sớm nhất để tư vấn và báo giá chi tiết.</p>
              <p style="margin-top: 20px; font-size: 13px; color: #b5a597;">
                Trân trọng,<br>
                <strong>Linh Hồ – LH Music Studio</strong>
              </p>
            </div>
          `,
        })
        .catch((cErr) => console.warn("[Mail] Failed to send customer confirmation:", cErr));
    }

    return { success: true, simulated: false, messageId: info.messageId };
  } catch (error: any) {
    console.error("[Mail] Failed to send live email:", error);
    logEmailToFile(`[SEND ERROR]\nTo: ${adminEmail}\nError: ${error.message}`);
    return { success: false, error: error.message };
  }
}
