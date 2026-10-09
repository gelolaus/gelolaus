import { apiError, readOnlyRoute } from "@/lib/api";
import { getRolesPayload } from "@/lib/profile";

const route = readOnlyRoute((request) => {
  const organization = request.nextUrl.searchParams.get("organization");
  if (organization === null) return Response.json(getRolesPayload());

  if (organization.trim() === "") {
    return apiError(
      400,
      "invalid_parameter",
      'The "organization" query parameter must not be empty.',
      'Pass a name like ?organization=Notion, or omit "organization" to list all roles.',
    );
  }
  return Response.json(getRolesPayload(organization.trim()));
});

export const GET = route.GET;
export const OPTIONS = route.OPTIONS;
export const POST = route.POST;
export const PUT = route.PUT;
export const PATCH = route.PATCH;
export const DELETE = route.DELETE;
