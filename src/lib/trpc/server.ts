import "server-only";

import { createCaller } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";
import { headers } from "next/headers";
import { cache } from "react";

const createContext = cache(async () => {
  return createTRPCContext({
    headers: new Headers(headers()),
  });
});

export const api = createCaller(await createContext());
