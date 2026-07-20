import { getEnterpriseIntelligenceSnapshot } from "../../../lib/intelligence";

export async function GET() {
  return Response.json(getEnterpriseIntelligenceSnapshot());
}
