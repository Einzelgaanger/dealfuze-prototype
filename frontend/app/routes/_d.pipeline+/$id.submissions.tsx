import { ActionFunctionArgs, json } from "@remix-run/node";
import { redirectWithToast } from "@/components/toast/toast.server";
import { api } from "@/utils/api.server";

export async function action(args: ActionFunctionArgs) {
  const { request } = args;
  const data = await request.json();

  switch (request.method) {
    case "DELETE":
      await api.delete("/submissions", {
        loaderArgs: args,
        data: {
          submissionIds: data.submissionIds,
        },
      });
      return redirectWithToast(data.redirectUrl, {
        title: "Deleted submissions",
      });
    case "POST":
      try {
        await api.post(`/submissions/${data.submissionId}/retry`, {
          loaderArgs: args,
        });
        return redirectWithToast(data.redirectUrl, {
          type: "success",
          title: "Retried submission",
        });
      } catch (error) {
        return redirectWithToast(data.redirectUrl, {
          type: "error",
          title: "Failed to retry submission",
        });
      }
    default:
      return json({ success: false });
  }
}
