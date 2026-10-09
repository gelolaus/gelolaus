import { apiError, readOnlyRoute } from "@/lib/api";
import {
  getProfilePayload,
  isProfileField,
  PROFILE_FIELDS,
  type ProfileField,
} from "@/lib/profile";

const route = readOnlyRoute((request) => {
  const raw = request.nextUrl.searchParams.get("fields");
  if (raw === null) return Response.json(getProfilePayload());

  const requested = raw.split(",").map((f) => f.trim());
  const unknown = requested.filter((f) => !isProfileField(f));
  if (unknown.length > 0) {
    return apiError(
      400,
      "invalid_parameter",
      `The "fields" query parameter contains unknown fields: ${unknown.map((f) => `"${f}"`).join(", ")}.`,
      `Use a comma-separated list of: ${PROFILE_FIELDS.join(", ")}.`,
    );
  }
  return Response.json(getProfilePayload(requested as ProfileField[]));
});

export const GET = route.GET;
export const OPTIONS = route.OPTIONS;
export const POST = route.POST;
export const PUT = route.PUT;
export const PATCH = route.PATCH;
export const DELETE = route.DELETE;
