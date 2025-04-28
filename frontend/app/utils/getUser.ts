import { getAuth } from "@clerk/remix/ssr.server";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";

export async function getUser(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args);

  if (!userId) {
    throw redirect("/login");
  }

  return userId;
}
