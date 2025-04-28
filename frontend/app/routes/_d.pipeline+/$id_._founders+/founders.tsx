import { redirectWithToast } from "@/components/toast/toast.server";
import { api } from "@/utils/api.server";
import { FormDocument, FormType, SubmissionDocument } from "@deal-fuze/server";
import { Outlet, useLoaderData } from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/node";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useNavigate } from "@remix-run/react";
import { SubmissionsTable } from "@/components/submissions-table";
export async function loader(args: LoaderFunctionArgs) {
  const { id } = args.params;

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

  const founderSubmissions = await api.get<{ data: SubmissionDocument[] }>(
    `/forms/${form._id}/submissions`,
    {
      loaderArgs: args,
    }
  );

  return {
    form,
    founderSubmissions: founderSubmissions?.data ?? [],
  };
}

export default function FoundersPage() {
  const { form, founderSubmissions } = useLoaderData<{
    form: FormDocument;
    founderSubmissions: SubmissionDocument[];
  }>();

  return (
    <div>
      <Outlet />
      <SubmissionsTable form={form} submissions={founderSubmissions} />
    </div>
  );
}
