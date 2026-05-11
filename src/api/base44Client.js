import { createClient } from "@base44/sdk";

export const base44 = createClient({
  appId: "6a01be371e984e58f6b0fe6f",
});

export const { entities, auth } = base44;
