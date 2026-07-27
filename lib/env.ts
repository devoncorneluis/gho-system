function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const ENV = {
  NEXT_PUBLIC_SITE_URL: requireEnv("NEXT_PUBLIC_SITE_URL"),

  EMAIL_PROVIDER: process.env.EMAIL_PROVIDER ?? "resend",

  EMAIL_FROM: requireEnv("EMAIL_FROM"),

  RESEND_API_KEY: process.env.RESEND_API_KEY ?? "",
};