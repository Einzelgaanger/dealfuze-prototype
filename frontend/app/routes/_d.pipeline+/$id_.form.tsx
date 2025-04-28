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

const formSchema = z.object({
  investorForm: z.custom<IForm>(),
  founderForm: z.custom<IForm>(),
  matching: z.custom<BaseMatchCriteriaRequest>(),
});

export async function loader(args: LoaderFunctionArgs) {
  const { id } = args.params;
  const pipeline = await api.get<Pipeline>(`/pipeline/${id}`, {
    loaderArgs: args,
  });
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

  const investorForm = forms.data.find(
    (form) => form.submitterType === FormType.INVESTOR
  );
  const founderForm = forms.data.find(
    (form) => form.submitterType === FormType.FOUNDER
  );

  if (!investorForm || !founderForm) {
    return redirectWithToast(`/pipeline/${id}`, {
      type: "error",
      title: "No form found",
    });
  }

  if (!matchCriteria) {
    return redirectWithToast(`/pipeline/${id}`, {
      type: "error",
      title: "No match criteria found",
    });
  }

  return { founderForm, investorForm, pipeline, matchCriteria };
}

export async function action(args: ActionFunctionArgs) {
  const { id } = args.params;
  const json = await args.request.json();
  const parsed = formSchema.safeParse(json);

  if (!parsed.success) {
    return redirectWithToast(`/pipeline/${id}/form`, {
      type: "error",
      title: "Invalid form",
      description: parsed.error.message,
    });
  }

  try {
    await api.put<FormUpdateRequest>(`/pipeline/${id}/form`, {
      data: parsed.data,
      loaderArgs: args,
    });

    return redirectWithToast(`/pipeline/${id}/form`, {
      type: "success",
      title: "Form saved",
    });
  } catch (error) {
    return redirectWithToast(`/pipeline/${id}/form`, {
      type: "error",
      title: "Failed to save form",
    });
  }
}

export default function PipelineForm() {
  const { founderForm, investorForm, pipeline, matchCriteria } = useLoaderData<{
    founderForm: FormDocument;
    investorForm: FormDocument;
    pipeline: Pipeline;
    matchCriteria: MatchCriteriaDocument;
  }>();
  const { id } = useParams();
  const fetcher = useFetcher();

  const [formType, setFormType] = useState<FormType | "both">(FormType.FOUNDER);
  const [data, setData] = useState<FormBuilderData>({
    investor: investorForm,
    founder: founderForm,
    matching: matchCriteria.matchCriteria,
  });
  const originalData = useRef<FormBuilderData>({
    investor: { ...investorForm } as unknown as FormDocument,
    founder: { ...founderForm } as unknown as FormDocument,
    matching: [...matchCriteria.matchCriteria],
  });

  return (
    <div className="flex flex-col gap-2">
      <Outlet />
      <div className="flex flex-col md:flex-row justify-between w-full gap-4 items-center">
        <div className="flex flex-col gap-2 pl-4">
          <h1 className="text-2xl font-bold">{pipeline.name} Forms</h1>
          <Link
            to={`/pipeline/${id}/match-criteria`}
            className="text-xs text-gray-700 hover:text-gray-800 hover:underline"
          >
            <Button variant="outline" size="sm">
              Edit Match Criteria
            </Button>
          </Link>
        </div>
        <div className="md:order-last flex gap-1 justify-end w-fit items-center">
          {JSON.stringify(data) !== JSON.stringify(originalData.current) ||
          JSON.stringify(data.matching) !==
            JSON.stringify(originalData.current.matching) ? (
            <div className="flex justify-end pr-4">
              <Button
                onClick={() => {
                  fetcher.submit(
                    JSON.stringify({
                      investorForm: data.investor,
                      founderForm: data.founder,
                      matching: data.matching,
                    } as FormUpdateRequest),
                    {
                      method: "POST",
                      action: `/pipeline/${id}/form`,
                      encType: "application/json",
                    }
                  );
                }}
                disabled={fetcher.state === "submitting"}
                size="sm"
              >
                {fetcher.state === "submitting" ? "Saving..." : `Save Forms`}
              </Button>
            </div>
          ) : (
            <Button className="bg-black pointer-events-none invisible" disabled>
              "Save Placeholder"
            </Button>
          )}
          <div className="flex items-center divide-x border border-gray-200 rounded-md shadow-sm w-fit">
            <button
              className={cn(
                `px-4 py-2 transition-colors border-gray-200 text-xs no-underline ${
                  formType === FormType.FOUNDER
                    ? "text-gray-700 hover:bg-gray-50"
                    : "text-black bg-gray-100"
                }`
              )}
              onClick={() => {
                setFormType(FormType.FOUNDER);
              }}
            >
              Founder
            </button>
            <button
              className={`px-4 py-2 transition-colors group-hover:bg-white text-xs no-underline ${
                formType === FormType.INVESTOR
                  ? "text-gray-700 hover:bg-gray-50"
                  : "text-black bg-gray-100"
              }`}
              onClick={() => {
                setFormType(FormType.INVESTOR);
              }}
            >
              Investor
            </button>
            <button
              className={`px-4 py-2 transition-colors group-hover:bg-white text-xs no-underline text-nowrap ${
                formType === "both"
                  ? "text-gray-700 hover:bg-gray-50"
                  : "text-black bg-gray-100"
              }`}
              onClick={() => {
                setFormType("both");
              }}
            >
              Show Both
            </button>
          </div>
        </div>
      </div>
      <div className="formio-builder-wrapper">
        <div className="w-full relative">
          <div className="relative flex w-full pt-2">
            <div
              className={`${
                formType === FormType.FOUNDER || formType === "both"
                  ? "block w-full"
                  : "hidden"
              }`}
            >
              <FormBuilder
                formType={FormType.FOUNDER}
                data={data}
                setData={setData}
              />
            </div>
            <div
              className={`${
                formType === FormType.INVESTOR || formType === "both"
                  ? "block w-full"
                  : "hidden"
              }`}
            >
              <FormBuilder
                formType={FormType.INVESTOR}
                data={data}
                setData={setData}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
