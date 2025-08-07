import { convert } from "html-to-text";
import { StringHelper } from "src/core/helpers/string-helper";
import { mailOptions, MailSender } from "src/core/lib/mail-sender/mail-sender";

type StoredMail = {
  to: string | string[];
  subject: string;
  fromName?: string;
  fromEmail?: string;
  bodyHtml?: string;
  bodyText: string;
};

export class InMemoryMailSender implements MailSender {
  private mails: StoredMail[] = [];

  async sendEmail({
    to,
    subject,
    fromName,
    fromEmail,
    bodyMessage,
  }: mailOptions): Promise<void> {
    if (!bodyMessage) throw new Error("Texto da mensagem não foi definido");

    const isHtml = StringHelper.isHTML(bodyMessage);
    const text = isHtml
      ? convert(bodyMessage, { wordwrap: false })
      : bodyMessage;

    const stored: StoredMail = {
      to,
      subject,
      fromName,
      fromEmail,
      bodyHtml: isHtml ? bodyMessage : undefined,
      bodyText: text,
    };

    this.mails.push(stored);
  }

  getSentMails(): StoredMail[] {
    return this.mails;
  }

  clear(): void {
    this.mails = [];
  }
}
