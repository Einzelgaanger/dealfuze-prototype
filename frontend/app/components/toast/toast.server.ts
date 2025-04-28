import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

export const toastKey = "toast";

const ToastSchema = z.object({
  description: z.string().optional(),
  id: z.string().default(() => `${Math.random()}`),
  title: z.string().optional(),
  type: z.enum(["message", "success", "error"]).default("message"),
});

export const toastSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "en_toast",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: process.env.SESSION_SECRET!.split(","),
    secure: process.env.NODE_ENV === "production",
  },
});

export type Toast = z.infer<typeof ToastSchema>;
export type ToastInput = z.input<typeof ToastSchema>;

/** A function that returns a redirect to the given url and displays the toast message  */
export async function redirectWithToast(
  url: string,
  toast: ToastInput,
  init?: ResponseInit
) {
  const toastHeaders = await createToastHeaders(toast);

  const combined = new Headers();
  for (const header of [init?.headers, toastHeaders]) {
    if (!header) continue;
    for (const [key, value] of new Headers(header).entries()) {
      combined.append(key, value);
    }
  }

  return redirect(url, {
    ...init,
    headers: combined,
  });
}

export async function createToastHeaders(toastInput: ToastInput) {
  const session = await toastSessionStorage.getSession();
  const toast = ToastSchema.parse(toastInput);
  session.flash(toastKey, toast);
  const cookie = await toastSessionStorage.commitSession(session);
  return new Headers({ "set-cookie": cookie });
}

export async function getToast(request: Request) {
  const session = await toastSessionStorage.getSession(
    request.headers.get("cookie")
  );
  const result = ToastSchema.safeParse(session.get(toastKey));
  const toast = result.success ? result.data : null;

  return {
    toast,
    headers: toast
      ? new Headers({
          "set-cookie": await toastSessionStorage.destroySession(session),
        })
      : null,
  };
}
