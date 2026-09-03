import { Resend } from "resend";
import { EmailMessage, EmailProvider } from "../emailProvider";

export class ResendProvider implements EmailProvider {
  async send(message: EmailMessage): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured.");
    }

    const resend = new Resend(apiKey);

const from =
  process.env.RESEND_FROM_EMAIL ||
  "GHO <admin@corneluisgroup.com>";

    const { error } = await resend.emails.send({
      from,
      to: message.to,
      subject: message.subject,
      html: message.html,
    });

    if (error) {
      throw new Error(error.message);
    }
  }
}