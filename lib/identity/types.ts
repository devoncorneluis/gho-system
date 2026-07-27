export type IdentityRole =
  | "super_admin"
  | "admin"
  | "driver"
  | "agent";

export interface CreateIdentityUser {
  email: string;
  full_name: string;
  platform_id: string;
  role: IdentityRole;
}