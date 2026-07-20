import { getPerformanceSnapshot } from "../../../lib/performance";

export async function GET() {
  const snapshot = await getPerformanceSnapshot();
  return Response.json(snapshot);
}
