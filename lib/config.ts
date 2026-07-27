import { ENV } from "./env";

export const GHO = {
  company: "Corneluis Group Pty Ltd",

  product: "GHO",

  email: {
    provider: ENV.EMAIL_PROVIDER,
    from: ENV.EMAIL_FROM,
    support: "support@gho.co.za",
  },

  website: ENV.NEXT_PUBLIC_SITE_URL,
};