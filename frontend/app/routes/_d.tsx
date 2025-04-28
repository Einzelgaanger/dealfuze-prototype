import { Sidebar } from "@/components/sidebar";
import {
  Link,
  Outlet,
  useLocation,
  useRouteError,
  isRouteErrorResponse,
} from "@remix-run/react";
import { SignedIn, useAuth, useUser } from "@clerk/remix";
import { getAuth } from "@clerk/remix/ssr.server";
import { LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

export function shouldRevalidate({
  currentParams,
  nextParams,
  formMethod,
  defaultShouldRevalidate,
}: {
  currentParams: any;
  nextParams: any;
  formMethod: string;
  defaultShouldRevalidate: boolean;
}) {
  if (formMethod === "GET" && currentParams === nextParams) {
    return false;
  }

  return defaultShouldRevalidate;
}

export const loader: LoaderFunction = async (args) => {
  const { userId, sessionClaims } = await getAuth(args);
  if (!userId) {
    return redirect("/login");
  }

  return {
    fullName: sessionClaims?.fullName,
  };
};

export default function DashboardLayout() {
  const { fullName } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();

  const backPath = pathname.split("/").slice(0, -1).join("/") || "/dashboard";

  return (
    <div className="flex items-center w-full">
      <div className="w-full h-full">
        <header className=""></header>
        <Sidebar userName={fullName}>
          <main
            className="w-full bg-white h-full py-20 px-4 md:px-28 md:py-20 overflow-y-auto"
            style={{
              background: "white",
              backgroundImage: "radial-gradient(lightgray 1px, transparent 0)",
              backgroundSize: "30px 30px",
              backgroundPosition: "-19px -19px",
            }}
          >
            {pathname !== "/dashboard" && (
              <div className="mb-4 max-w-[1400px] mx-auto">
                <Link
                  to={backPath === "/pipeline" ? `/dashboard` : backPath}
                  className="text-gray-600 hover:text-gray-900  flex items-center gap-2 w-fit"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </Link>
              </div>
            )}
            <div className="flex flex-col gap-4 bg-white p-8 rounded-lg min-h-[40vh] border border-gray-100 shadow-sm max-w-[1400px] mx-auto">
              <Outlet />
            </div>
          </main>
        </Sidebar>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const { pathname } = useLocation();
  const { user } = useUser();
  const backPath = pathname.split("/").slice(0, -1).join("/") || "/dashboard";

  let errorMessage: string;
  let errorTitle: string;

  if (isRouteErrorResponse(error)) {
    errorTitle = `${error.status} ${error.statusText}`;
    errorMessage = error.data;
  } else if (error instanceof Error) {
    errorTitle = "Error";
    errorMessage = error.message;
  } else {
    errorTitle = "Unknown Error";
    errorMessage = "An unknown error occurred.";
  }

  return (
    <div className="flex items-center w-full">
      <div className="w-full h-full">
        <header className=""></header>
        <Sidebar userName={user?.fullName ?? "User"}>
          <main
            className="w-full bg-white h-full py-20 px-4 md:px-28 md:py-20 overflow-y-auto"
            style={{
              background: "white",
              backgroundImage: "radial-gradient(lightgray 1px, transparent 0)",
              backgroundSize: "30px 30px",
              backgroundPosition: "-19px -19px",
            }}
          >
            <div className="mb-4 max-w-[1400px] mx-auto">
              <Link
                to={backPath === "/pipeline" ? `/dashboard` : backPath}
                className="text-gray-600 hover:text-gray-900 flex items-center gap-2 w-fit"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </Link>
            </div>
            <div className="flex flex-col gap-4 bg-white p-8 rounded-lg min-h-[40vh] border border-gray-100 shadow-sm max-w-[1400px] mx-auto">
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {errorTitle}
                </h1>
                <p className="text-gray-600">{errorMessage}</p>
              </div>
            </div>
          </main>
        </Sidebar>
      </div>
    </div>
  );
}
