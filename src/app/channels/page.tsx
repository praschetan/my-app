import { headers } from "next/headers";
import ChannelsClient from "./channels-client";

export const dynamic = "force-dynamic";

export default function Page() {
  headers();
  return <ChannelsClient />;
}
