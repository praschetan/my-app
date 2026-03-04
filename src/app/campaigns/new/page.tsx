import { headers } from "next/headers";
import NewCampaignClient from "./new-client";

export const dynamic = "force-dynamic";

export default function Page() {
  headers();
  return <NewCampaignClient />;
}
