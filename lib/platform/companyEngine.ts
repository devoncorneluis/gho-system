import type { Company } from "../../types/platform";

export interface CompanyInput {
  id: string;
  name: string;
  legalName?: string;
  contactEmail?: string;
  country?: string;
}

export function buildCompany(input: CompanyInput): Company {
  const now = new Date().toISOString();
  return {
    id: input.id,
    name: input.name,
    legalName: input.legalName,
    contactEmail: input.contactEmail,
    country: input.country,
    createdAt: now,
    updatedAt: now,
  };
}

export function updateCompany(company: Company, patch: Partial<CompanyInput>): Company {
  return {
    ...company,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
}
