import { headers } from "next/headers";
import CampaignsClient from "./campaigns-client";

export const dynamic = "force-dynamic";

export default function Page() {
  headers();
  return <CampaignsClient />;
}
