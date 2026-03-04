import { headers } from "next/headers";
import DashboardClient from "./dashboard-client";

// Force dynamic rendering to prevent stale cache
export const dynamic = "force-dynamic";

export default function Page() {
  // Reading headers forces Next.js to treat this as dynamic
  headers();
  return <DashboardClient />;
}
