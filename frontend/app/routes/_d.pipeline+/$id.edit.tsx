import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input, TextArea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/utils/api.server";
import { getAuth } from "@clerk/remix/ssr.server";
import {
  ActionFunctionArgs,
  data,
  json,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { Pipeline } from "@/types/pipeline.type";
import { z } from "zod";
import { redirectWithToast } from "@/components/toast/toast.server";

const pipelineSchema = z.object({
  id: z.string(),
  pipelineName: z.string().min(3),
  description: z.string().optional(),
});

export async function action(args: ActionFunctionArgs) {
  const formData = await args.request.formData();
  const result = pipelineSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    // Use the new json helper
    return json(
      {
        errors: result.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  try {
    await api.put<{
      pipelineName: string;
      description: string | undefined;
    }>(`/pipeline/${result.data.id}`, {
      loaderArgs: args,
      data: {
        pipelineName: result.data.pipelineName,
        description: result.data.description,
      },
    });

    return redirectWithToast(`/pipeline/${args.params.id}`, {
      type: "success",
      title: "Pipeline updated",
      description: "Your pipeline has been updated",
    });
  } catch (error) {
    return redirectWithToast("/dashboard/create-pipeline", {
      type: "error",
      title: "Something went wrong",
      description: "Please try again later",
    });
  }
}

export async function loader(args: LoaderFunctionArgs) {
  const { id } = args.params;
  const pipeline = await api.get<Pipeline>(`/pipeline/${id}`, {
    loaderArgs: args,
  });
  return { pipeline };
}

export default function CreatePipeline() {
  const { pipeline } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const actionData = useActionData<typeof action>();

  return (
    <Dialog
      open={true}
      onOpenChange={() => {
        navigate(`/pipeline/${pipeline.id}`);
      }}
    >
      <DialogContent showClose={true}>
        <DialogHeader>
          <DialogTitle>Edit {pipeline.name}</DialogTitle>
        </DialogHeader>
        <Form className="grid gap-4" method="post" noValidate>
          <div className="grid gap-2">
            <Label htmlFor="pipelineName">Pipeline Name</Label>
            <input type="hidden" name="id" value={pipeline.id} />
            <Input
              required
              id="pipelineName"
              name="pipelineName"
              type="text"
              placeholder="My Pipeline"
              defaultValue={pipeline.name}
              minLength={3}
              aria-invalid={Boolean(actionData?.errors?.pipelineName)}
              aria-errormessage={
                actionData?.errors?.pipelineName
                  ? "pipelineName-error"
                  : undefined
              }
            />
            {actionData?.errors?.pipelineName && (
              <p className="text-sm text-red-500" id="pipelineName-error">
                {actionData.errors.pipelineName[0]}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <TextArea
              id="description"
              name="description"
              placeholder="Descriptions allow you to add notes to your pipeline"
              rows={4}
              defaultValue={pipeline.description}
              aria-invalid={Boolean(actionData?.errors?.description)}
              aria-errormessage={
                actionData?.errors?.description
                  ? "description-error"
                  : undefined
              }
            />
            {actionData?.errors?.description && (
              <p className="text-sm text-red-500" id="description-error">
                {actionData.errors.description[0]}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
