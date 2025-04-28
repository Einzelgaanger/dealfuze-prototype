import { getAuth } from "@clerk/remix/ssr.server";
import { redirect } from "@remix-run/node";
import { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async (request) => {
  const { userId } = await getAuth(request);
  if (userId) {
    return redirect("/dashboard");
  }
  return redirect("/login");
};
