import {
  json,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type { MetaFunction, LoaderFunction } from "@remix-run/node";
import type { LinksFunction } from "@remix-run/node";
import { rootAuthLoader } from "@clerk/remix/ssr.server";
import styles from "./tailwind.css?url";
import { ClerkApp } from "@clerk/remix";
import "./tailwind.css";
import { Toaster } from "sonner";
import { getToast } from "./components/toast/toast.server";
import { useToast } from "./components/toast/useToast";

export const loader: LoaderFunction = async (args) => {
  return rootAuthLoader(
    args,
    async ({ request }) => {
      const { toast, headers: toastHeaders } = await getToast(request);

      return json(
        { toast: toast },
        {
          headers: toastHeaders ?? undefined,
        }
      );
    },
    {
      signInForceRedirectUrl: "/login",
    }
  );
};

export const meta: MetaFunction = () => [
  {
    charset: "utf-8",
    title: "Deal Fuze",
    viewport: "width=device-width,initial-scale=1",
  },
];

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Toaster position="top-right" />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function App() {
  const { toast } = useLoaderData<typeof loader>();

  useToast(toast);

  return <Outlet />;
}

export default ClerkApp(App);
