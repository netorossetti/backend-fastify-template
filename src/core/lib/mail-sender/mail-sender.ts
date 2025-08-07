export type mailOptions = {
  fromName?: string | undefined;
  fromEmail?: string | undefined;
  to: string | string[];
  subject: string;
  bodyMessage: string;
};

export interface MailSender {
  sendEmail(opts: mailOptions): Promise<void>;
}
