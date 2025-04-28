import { api } from "@/utils/api.server";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  FormDocument,
  FormType,
  MatchCriteriaDocument,
  SubmissionDocument,
  SubmissionDataType,
} from "@deal-fuze/server";
import { useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { redirectWithToast } from "@/components/toast/toast.server";
import { z } from "zod";
import { ImportDialog } from "@/components/import-dialog";

const importDataSchema = z.object({
  submissions: z.array(z.custom<SubmissionDataType>()),
  optionsToAdd: z.optional(
    z.record(z.string(), z.array(z.custom<{ label: string; value: string }>()))
  ),
  formId: z.string(),
});

export function shouldRevalidate({
  currentParams,
  nextParams,
  formMethod,
  defaultShouldRevalidate,
}: {
  currentParams: any;
  nextParams: any;
  formMethod: string;
  defaultShouldRevalidate: boolean;
}) {
  if (currentParams.id === nextParams.id) {
    return false;
  }

  return defaultShouldRevalidate;
}

export async function action(args: ActionFunctionArgs) {
  const { id } = args.params;

  try {
    const { submissions, optionsToAdd, formId } =
      await importDataSchema.parseAsync(await args.request.json());

    if (optionsToAdd) {
      await api.patch(`/pipeline/${id}/form/${formId}`, {
        data: {
          optionsToAdd,
        },
        loaderArgs: args,
      });
    }

    await api.post(`/pipeline/${id}/form/${formId}/import`, {
      data: {
        formId: formId,
        submissions: submissions,
      },
      loaderArgs: args,
    });

    return redirectWithToast(`/pipeline/${id}/founders`, {
      type: "success",
      title: "Imported founders",
    });
  } catch (error) {
    console.error(error);
    return redirectWithToast(`/pipeline/${id}/founders`, {
      type: "error",
      title: "Error adding options to form",
    });
  }
}

export async function loader(args: LoaderFunctionArgs) {
  const { id } = args.params;

  const forms = await api.get<{ data: FormDocument[] }>(
    `/pipeline/${id}/form`,
    {
      loaderArgs: args,
    }
  );

  const matchCriteria = await api.get<MatchCriteriaDocument>(
    `/pipeline/${id}/match-criteria`,
    {
      loaderArgs: args,
    }
  );

  if (!matchCriteria) {
    return redirectWithToast(`/pipeline/${id}`, {
      type: "error",
      title: "No match criteria found",
    });
  }

  const founderForm = forms.data.find(
    (form) => form.submitterType === FormType.FOUNDER
  );

  if (!founderForm) {
    return redirectWithToast(`/pipeline/${id}`, {
      type: "error",
      title: "No founder form found",
    });
  }

  const founderSubmissions = await api.get<SubmissionDocument[]>(
    `/forms/${founderForm._id}/submissions`,
    {
      loaderArgs: args,
    }
  );

  return {
    founderForm,
    founderSubmissions,
    matchCriteria,
  };
}

export default function FoundersImport() {
  const { founderForm, matchCriteria } = useLoaderData<{
    founderForm: FormDocument;
    matchCriteria: MatchCriteriaDocument;
  }>();
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <ImportDialog
      formId={founderForm._id as string}
      isOpen={true}
      onClose={() => navigate("/pipeline/" + id + "/founders")}
      formComponents={founderForm.components}
      matchCriteria={matchCriteria}
    />
  );
}
