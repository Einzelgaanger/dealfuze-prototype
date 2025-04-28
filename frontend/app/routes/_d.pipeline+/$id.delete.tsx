import { redirectWithToast } from "@/components/toast/toast.server";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Dialog } from "@/components/ui/dialog";
import { Pipeline } from "@/types/pipeline.type";
import { api } from "@/utils/api.server";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData, useNavigate, useParams } from "@remix-run/react";

export async function action(args: ActionFunctionArgs) {
  const { id } = args.params;
  await api.delete(`/pipeline/${id}`, {
    loaderArgs: args,
  });
  return redirectWithToast("/dashboard", {
    type: "success",
    title: "Pipeline deleted",
  });
}

export async function loader(args: LoaderFunctionArgs) {
  const { id } = args.params;
  const pipeline = await api.get<Pipeline>(`/pipeline/${id}`, {
    loaderArgs: args,
  });
  return { pipeline };
}

export default function DeletePipeline() {
  const { pipeline } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <Dialog
      open={true}
      onOpenChange={() => {
        navigate("/pipeline/" + id);
      }}
    >
      <DialogContent showClose={true}>
        <DialogHeader>
          <DialogTitle>Delete Pipeline {pipeline.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2">
          <p>Are you sure you want to delete this pipeline?</p>
        </div>
        <Form method="delete">
          <DialogFooter>
            <Button
              className="px-10"
              variant="default"
              onClick={() => {
                navigate("/pipeline/" + id);
              }}
            >
              No
            </Button>
            <Button variant="destructive" type="submit">
              Yes, delete
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
