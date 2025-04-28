import { api, APIError } from "@/utils/api.server";
import { ActionFunctionArgs, json } from "@remix-run/node";

export async function action(args: ActionFunctionArgs) {
  const { request } = args;
  try {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (request.method === "POST" && pathname === "/api/webhook/brightdata") {
      const requestData = await request.json();

      const data = await api.post(pathname, {
        data: requestData,
      });
      return json(data);
    }
  } catch (error) {
    return json(
      { message: (error as APIError).message },
      { status: (error as APIError).status }
    );
  }

  return json({ message: "Method not allowed" }, { status: 405 });
}
