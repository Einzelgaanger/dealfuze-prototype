import { redirectWithToast } from "@/components/toast/toast.server";
import { api } from "@/utils/api.server";
import { FormDocument, FormType } from "@deal-fuze/server";
import { useLoaderData, useParams, useNavigate } from "@remix-run/react";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Dialog } from "@/components/ui/dialog";
import { FormViewer } from "@/components/form";
import { createFormSchema } from "@deal-fuze/server";

export async function action(args: ActionFunctionArgs) {
  const { id } = args.params;
  const formData = await args.request.json();

  const formId = formData["formId"];

  if (!formId) {
    return json({ error: "Form ID is required" }, { status: 400 });
  }

  const investorForm = await api.get<{ data: FormDocument }>(
    `/pipeline/${id}/form/${formId}`,
    {
      loaderArgs: args,
    }
  );

  if (!investorForm) {
    return redirectWithToast(`/pipeline/${id}`, {
      type: "error",
      title: "Form not found",
    });
  }

  const formSchema = createFormSchema(investorForm.data, false);
  const parsed = formSchema.safeParse(formData);

  if (!parsed.success) {
    return redirectWithToast(`/pipeline/${id}/investors`, {
      type: "error",
      title: "Form submission failed",
    });
  }

  try {
    const { success, submissionId } = await api.post<
      { formId: string; data: any },
      {
        success: boolean;
        submissionId: string;
      }
    >(`/forms/${formId}/submit`, {
      loaderArgs: args,
      data: {
        formId,
        data: parsed.data,
      },
    });

    if (!success || !submissionId) {
      return redirectWithToast(`/pipeline/${id}/founders`, {
        type: "error",
        title: "Form submission failed",
      });
    }

    return redirectWithToast(`/pipeline/${id}/founders`, {
      type: "success",
      title: "Founder added",
    });
  } catch (error) {
    console.error(error);
    console.log("FAILED");
    return redirectWithToast(`/pipeline/${id}/founders`, {
      type: "error",
      title: "Form submission failed",
    });
  }
}

export async function loader(args: LoaderFunctionArgs) {
  const { id } = args.params;

  try {
    const forms = await api.get<{ data: FormDocument[] }>(
      `/pipeline/${id}/form`,
      {
        loaderArgs: args,
      }
    );

    const form = forms.data.find(
      (form) => form.submitterType === FormType.FOUNDER
    );

    if (!form) {
      return redirectWithToast(`/pipeline/${id}`, {
        type: "error",
        title: "No founder form found",
      });
    }

    return {
      form,
    };
  } catch (error) {
    console.error(error);
    return redirectWithToast(`/pipeline/${id}`, {
      type: "error",
      title: "Error loading founder form",
    });
  }
}

export default function FoundersAddPage() {
  const { form } = useLoaderData<{ form: FormDocument }>();
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <Dialog
      open={true}
      onOpenChange={() => navigate("/pipeline/" + id + "/founders")}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Founder</DialogTitle>
          <DialogDescription>
            Fill out the form below to add a new founder to the pipeline.
          </DialogDescription>
        </DialogHeader>
        <FormViewer form={form} />
      </DialogContent>
    </Dialog>
  );
}
