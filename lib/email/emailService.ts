export type EmailAttachment = {
  filename: string;
  bytes: Uint8Array;
};

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
};

export async function sendEmail(
  message: EmailMessage
) {
  console.log(
    "Email queued:",
    message
  );

  return true;
}