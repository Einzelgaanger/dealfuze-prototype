import { api } from "@/utils/api.server";
import { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import {
  BaseMatchCriteriaRequest,
  FormDocument,
  FormType,
  FormUpdateRequest,
  IForm,
  MatchCriteriaDocument,
} from "@deal-fuze/server";
import {
  Outlet,
  useLoaderData,
  useParams,
  useFetcher,
  Link,
} from "@remix-run/react";
import { Pipeline } from "@/types/pipeline.type";
import { cn } from "@/lib/utils";
import { redirectWithToast } from "@/components/toast/toast.server";
import { useState, useRef } from "react";
import {
  FormBuilder,
  FormBuilderData,
} from "@/components/form-builder/form-builder";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { FormViewer } from "@/components/form";

const formSchema = z.object({
  investorForm: z.custom<IForm>(),
  founderForm: z.custom<IForm>(),
  matching: z.custom<BaseMatchCriteriaRequest>(),
});

export async function loader(args: LoaderFunctionArgs) {
  const { id, formId } = args.params;

  console.log("id", id);
  console.log("formId", formId);

  try {
    const form = await api.get<{ data: FormDocument }>(`/forms/${formId}`, {
      loaderArgs: args,
    });

    if (!form.data) {
      return redirectWithToast(`/pipeline/${id}/form`, {
        type: "error",
        title: "No form found",
      });
    }

    return { form: form.data };
  } catch (error) {
    return redirectWithToast(`/pipeline/${id}/form`, {
      type: "error",
      title: "No form found",
    });
  }
}

export default function PipelineForm() {
  const { form } = useLoaderData<{
    form: FormDocument;
  }>();
  useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col md:flex-row justify-between w-full gap-4 items-center">
        <div className="flex flex-col gap-2 pl-4 flex-1">
          <h1 className="text-2xl font-bold">{form.name}</h1>
          <FormViewer form={form} />
        </div>
      </div>
    </div>
  );
}
