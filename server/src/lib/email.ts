import nodemailer, { Transporter } from 'nodemailer';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export interface EmailResult {
  messageId: string;
  accepted: string[];
  rejected: string[];
}

const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 1000;

class EmailClient {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.resend.io',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_API_KEY,
        pass: process.env.SMTP_PASS || process.env.EMAIL_API_KEY,
      },
    });
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async sendWithRetry(options: EmailOptions, attempt: number = 1): Promise<EmailResult> {
    try {
      const result = await this.transporter.sendMail({
        from: options.from || process.env.EMAIL_FROM || 'orders@roastery.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      const emailResult: EmailResult = {
        messageId: result.messageId,
        accepted: result.accepted,
        rejected: result.rejected,
      };

      console.log(`[Email] Sent to ${emailResult.accepted.join(', ')} - MessageId: ${emailResult.messageId}`);
      return emailResult;
    } catch (error) {
      const err = error as Error;
      console.error(`[Email] Send attempt ${attempt} failed: ${err.message}`);

      if (attempt >= MAX_RETRIES) {
        console.error(`[Email] All ${MAX_RETRIES} attempts exhausted for "${options.subject}" to ${options.to}`);
        throw error;
      }

      const delayMs = INITIAL_DELAY_MS * Math.pow(2, attempt - 1);
      console.log(`[Email] Retrying in ${delayMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
      await this.sleep(delayMs);

      return this.sendWithRetry(options, attempt + 1);
    }
  }

  async send(options: EmailOptions): Promise<EmailResult> {
    console.log(`[Email] Sending "${options.subject}" to ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);
    return this.sendWithRetry(options);
  }
}

let emailClientInstance: EmailClient | null = null;

export function getEmailClient(): EmailClient {
  if (!emailClientInstance) {
    emailClientInstance = new EmailClient();
  }
  return emailClientInstance;
}

export async function sendEmail(to: string | string[], subject: string, html: string): Promise<EmailResult> {
  return getEmailClient().send({ to, subject, html });
}

export default EmailClient;