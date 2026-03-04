import { headers } from "next/headers";
import AudiencesClient from "./audiences-client";

export const dynamic = "force-dynamic";

export default function Page() {
  headers();
  return <AudiencesClient />;
}
