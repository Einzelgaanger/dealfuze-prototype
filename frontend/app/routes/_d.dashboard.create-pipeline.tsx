import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { redirectWithToast } from "@/components/toast/toast.server";

const pipelineSchema = z.object({
  pipelineName: z.string().min(3),
  description: z.string().optional(),
  copyFromPipelineId: z.string().optional(),
});

export function shouldRevalidate() {
  return false;
}

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
    const { data } = await api.post<
      z.infer<typeof pipelineSchema>,
      {
        data: {
          id: string;
        };
      }
    >("/pipeline", {
      loaderArgs: args,
      data: {
        pipelineName: result.data.pipelineName,
        description: result.data.description,
        copyFromPipelineId: result.data.copyFromPipelineId,
      },
    });

    return redirectWithToast(`/pipeline/${data.id}`, {
      type: "success",
      title: "Pipeline created",
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
  const { getToken } = await getAuth(args);
  const token = await getToken();

  const pipelines = await api.get<Pipeline[]>("/pipeline", {
    token: token ?? undefined,
  });

  return { pipelines };
}

export default function CreatePipeline() {
  const { pipelines } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const actionData = useActionData<typeof action>();

  return (
    <Dialog
      open={true}
      onOpenChange={() => {
        navigate("/dashboard");
      }}
    >
      <DialogContent showClose={true}>
        <DialogHeader>
          <DialogTitle>Create New Pipeline</DialogTitle>
          <DialogDescription>
            Create a new pipeline to start finding deals. Pipelines allow you to
            organise different groups of founders and investors to match.
          </DialogDescription>
        </DialogHeader>
        <Form className="grid gap-4" method="post" noValidate>
          <div className="grid gap-2">
            <Label htmlFor="pipelineName">Pipeline Name</Label>
            <Input
              required
              id="pipelineName"
              name="pipelineName"
              type="text"
              placeholder="My Pipeline"
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
          {pipelines && pipelines.length > 0 && (
            <div className="grid gap-2">
              <Label htmlFor="copyFromPipelineId">
                Copy from an existing pipeline?
              </Label>
              <Select name="copyFromPipelineId">
                <SelectTrigger id="copyFromPipelineId">
                  <SelectValue placeholder="Select a pipeline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem className="text-gray-500" value="none">
                      None
                    </SelectItem>
                    {pipelines.map((pipeline) => (
                      <SelectItem key={pipeline.id} value={pipeline.id}>
                        {pipeline.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
