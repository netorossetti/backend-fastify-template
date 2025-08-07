import { convert } from "html-to-text";
import nodemailer from "nodemailer";
import { env } from "src/core/env";
import { StringHelper } from "src/core/helpers/string-helper";
import { MailSender, mailOptions } from "src/core/lib/mail-sender/mail-sender";

export class NodemailerMailSender implements MailSender {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  async sendEmail({
    to,
    subject,
    fromName,
    fromEmail,
    bodyMessage,
  }: mailOptions): Promise<void> {
    if (!bodyMessage) throw new Error("Texto da mensagem não foi definido");

    const isHtml = StringHelper.isHTML(bodyMessage);
    const sendFromEmail = fromEmail ?? env.SMTP_USER;
    const sendFromName = fromName ?? env.SMTP_NAME;

    if (env.NODE_ENV === "production") {
      await this.transporter.sendMail({
        from: `"${sendFromName}" <${sendFromEmail}>`,
        to,
        subject,
        text: isHtml ? undefined : bodyMessage,
        html: isHtml ? bodyMessage : undefined,
      });
    } else if (env.NODE_ENV === "dev") {
      let text = isHtml
        ? convert(bodyMessage, { wordwrap: false })
        : bodyMessage;
      console.log(
        "## FAKE EMAIL ###################################################"
      );
      console.log(`From: "${sendFromName}" <${sendFromEmail}>`);
      console.log(`To: `, to);
      console.log(text);
      console.log(
        "#################################################################"
      );
    }
  }
}
