import { headers } from "next/headers";
import ContentClient from "./content-client";

export const dynamic = "force-dynamic";

export default function Page() {
  headers();
  return <ContentClient />;
}
