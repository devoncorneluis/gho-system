import { EmailMessage, EmailProvider } from "../emailProvider";

export class ResendProvider implements EmailProvider {
  async send(message: EmailMessage): Promise<void> {
    console.log("Sending email via Resend");
    console.log(message);
  }
}