export type EmailTemplate =
  | "welcome-platform-admin"
  | "password-reset"
  | "driver-assigned"
  | "trip-dispatched"
  | "invoice";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  template: EmailTemplate;
}