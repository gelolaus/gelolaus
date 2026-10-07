import { apiError, readOnlyRoute } from "@/lib/api";
import { getProjectsPayload } from "@/lib/profile";

const route = readOnlyRoute((request) => {
  const raw = request.nextUrl.searchParams.get("year");
  if (raw === null) return Response.json(getProjectsPayload());

  const year = Number(raw);
  if (!/^\d{4}$/.test(raw) || !Number.isInteger(year)) {
    return apiError(
      400,
      "invalid_parameter",
      `The "year" query parameter must be a four-digit year, got "${raw}".`,
      'Pass a value like ?year=2026, or omit "year" to list all projects.',
    );
  }
  return Response.json(getProjectsPayload(year));
});

export const GET = route.GET;
export const OPTIONS = route.OPTIONS;
export const POST = route.POST;
export const PUT = route.PUT;
export const PATCH = route.PATCH;
export const DELETE = route.DELETE;
