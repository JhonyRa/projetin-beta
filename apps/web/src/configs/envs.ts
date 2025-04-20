import getConfig from "next/config";

const configs = getConfig();

export const { NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, NEXT_PUBLIC_API_URL } =
  configs?.publicRuntimeConfig ?? {};
