import { redirectWithToast } from "@/components/toast/toast.server";
import { api } from "@/utils/api.server";
import {
  FormDocument,
  FormType,
  SubmissionDocument,
  SubmissionDataType,
} from "@deal-fuze/server";
import { Outlet, useLoaderData } from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/node";
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
} from "@tanstack/react-table";
import { useMemo } from "react";
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
    (form) => form.submitterType === FormType.INVESTOR
  );

  if (!form) {
    return redirectWithToast(`/pipeline/${id}`, {
      type: "error",
      title: "No investor form found",
    });
  }

  const investorSubmissions = await api.get<{ data: SubmissionDocument[] }>(
    `/forms/${form._id}/submissions`,
    {
      loaderArgs: args,
    }
  );

  return {
    form,
    investorSubmissions: investorSubmissions?.data ?? [],
  };
}

export default function InvestorsPage() {
  const { form, investorSubmissions } = useLoaderData<{
    form: FormDocument;
    investorSubmissions: SubmissionDocument[];
  }>();
  const columnHelper = createColumnHelper<SubmissionDataType>();
  const navigate = useNavigate();
  const columns = useMemo(() => {
    return form.components.map((component) => {
      return columnHelper.accessor(
        (row: Record<string, any>) => row[component.key],
        {
          id: component.key,
          header: component.label,
          cell: (info) => {
            const value = info.getValue();
            if (Array.isArray(value)) {
              return value.join(", ");
            }
            return value?.toString() || "-";
          },
        }
      );
    });
  }, [form.components]);

  const table = useReactTable({
    data: investorSubmissions.map((submission) => submission.data),
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <Outlet />
      <SubmissionsTable form={form} submissions={investorSubmissions} />
    </div>
  );
}
