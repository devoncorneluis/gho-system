import { SendEmailOptions } from "./types";
import { ResendProvider } from "./providers/resendProvider";

const provider = new ResendProvider();

export async function sendEmail({
  to,
  subject,
  html,
}: SendEmailOptions) {
  await provider.send({
    to,
    subject,
    html,
  });

  return {
    success: true,
  };
}