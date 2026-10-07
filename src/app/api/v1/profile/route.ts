import { readOnlyRoute } from "@/lib/api";
import { getProfilePayload } from "@/lib/profile";

const route = readOnlyRoute(() => Response.json(getProfilePayload()));

export const GET = route.GET;
export const OPTIONS = route.OPTIONS;
export const POST = route.POST;
export const PUT = route.PUT;
export const PATCH = route.PATCH;
export const DELETE = route.DELETE;
