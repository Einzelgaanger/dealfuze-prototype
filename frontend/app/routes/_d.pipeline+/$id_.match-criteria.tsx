import { api } from "@/utils/api.server";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  AdvancedMatchCriteriaRequest,
  FormComponent,
  FormDocument,
  FormType,
  IForm,
  MatchCriteria,
  MatchCriteriaDocument,
  MatchField,
} from "@deal-fuze/server";
import {
  Outlet,
  useLoaderData,
  useParams,
  Form,
  useFetcher,
} from "@remix-run/react";
import { Button } from "@/components/ui/button";
import { List, Plus, Trash, User, Zap } from "lucide-react";
import { redirectWithToast } from "@/components/toast/toast.server";
import { PreviewFormField } from "@/components/form-builder/preview-field";
import { AVAILABLE_COMPONENTS } from "@/components/form-builder/form-builder";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OptionsComponent } from "@/components/form-builder/editors/options-component-editor";
import { getComponentOptions } from "@/components/form-builder/editors/options-component-editor";
import { OptionsComponentType } from "@/components/form-builder/editors/options-component-editor";
import { z } from "zod";
import { MatchType } from "@deal-fuze/server";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionTrigger,
  AccordionItem,
  AccordionContent,
} from "@/components/ui/accordion";

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
  if (formMethod === "GET" && currentParams.id === nextParams.id) {
    return false;
  }

  return defaultShouldRevalidate;
}

const matchCriteriaSchema = z.array(
  z.object({
    founderField: z.string(),
    investorField: z.string(),
    matchType: z.nativeEnum(MatchType),
    weight: z.number().optional(),
    required: z.boolean().optional(),
  })
);

export async function action(args: ActionFunctionArgs) {
  const { id } = args.params;
  const json = await args.request.json();
  const parsed = matchCriteriaSchema.safeParse(json);

  if (!parsed.success) {
    return redirectWithToast(`/pipeline/${id}/match-criteria`, {
      type: "error",
      title: "Invalid match criteria",
      description: parsed.error.message,
    });
  }

  try {
    await api.put<AdvancedMatchCriteriaRequest, MatchCriteriaDocument>(
      `/pipeline/${id}/match-criteria`,
      {
        data: parsed.data,
        loaderArgs: args,
      }
    );
  } catch (error) {
    return redirectWithToast(`/pipeline/${id}/match-criteria`, {
      type: "error",
      title: "Failed to update match criteria",
    });
  }

  return redirectWithToast(`/pipeline/${id}/match-criteria`, {
    type: "success",
    title: "Match criteria updated",
  });
}

export async function loader(args: LoaderFunctionArgs) {
  const { id } = args.params;
  const matchCriteria = await api.get<MatchCriteriaDocument>(
    `/pipeline/${id}/match-criteria`,
    {
      loaderArgs: args,
    }
  );
  const forms = await api.get<{ data: FormDocument[] }>(
    `/pipeline/${id}/form`,
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

  return { _matchCriteria: matchCriteria, investorForm, founderForm };
}

export default function PipelineMatchCriteria() {
  const { _matchCriteria, investorForm, founderForm } = useLoaderData<{
    _matchCriteria: MatchCriteriaDocument;
    investorForm: IForm;
    founderForm: IForm;
  }>();
  const { id } = useParams();
  const [showNewMatchCriteria, setShowNewMatchCriteria] = useState(false);
  const [matchCriteriaData, setMatchCriteriaData] = useState<MatchField[]>(
    _matchCriteria.matchCriteria
  );
  const fetcher = useFetcher();

  const matchCriteria = new MatchCriteria(matchCriteriaData);

  const handleAddMatchCriteria = ({
    founderField,
    investorField,
  }: {
    founderField: string;
    investorField: string;
  }) => {
    matchCriteria.addMatchCriteria(founderField, investorField);
    setMatchCriteriaData(matchCriteria.matchCriteria);
  };

  const handleUpdateMatchCriteria = (
    founderField: string,
    investorField: string,
    update: { matchType?: MatchType; weight?: number; required?: boolean }
  ) => {
    matchCriteria.editMatchCriteria(founderField, investorField, update);
    setMatchCriteriaData(matchCriteria.matchCriteria);
  };
  return (
    <div className="flex flex-col gap-6">
      <Outlet />
      <h1 className="text-2xl font-bold">Match Criteria</h1>
      <div className="w-full flex justify-between pr-8">
        <NewMatchCriteria
          founderComponents={founderForm.components.filter(
            (c) => !matchCriteria.hasField(c.key)
          )}
          investorComponents={investorForm.components.filter(
            (c) => !matchCriteria.hasField(c.key)
          )}
          show={showNewMatchCriteria}
          onClose={(value) => setShowNewMatchCriteria(value ?? false)}
          handleAddMatchCriteria={handleAddMatchCriteria}
        />
        <Button
          size="sm"
          className="gap-2 flex"
          onClick={() => {
            fetcher.submit(
              JSON.stringify(matchCriteriaData as AdvancedMatchCriteriaRequest),
              {
                method: "POST",
                action: `/pipeline/${id}/match-criteria`,
                encType: "application/json",
              }
            );
          }}
          disabled={fetcher.state === "submitting"}
        >
          Save Match Criteria
        </Button>
      </div>
      <div className="w-full flex flex-col gap-4">
        <div className="grid gap-8">
          <div className="flex gap-8">
            <h3 className="w-full border-b p-2 font-semibold flex items-center gap-2">
              Founder
            </h3>
            <h3 className="w-full border-b p-2 font-semibold flex items-center gap-2">
              Investor
            </h3>
          </div>
          {matchCriteria.matchCriteria.map((element) => (
            <div
              key={element.founderField}
              className="grid grid-cols-[1fr,auto,1fr] items-start"
            >
              <div className="w-full flex flex-col gap-2">
                <FieldPreview
                  component={
                    founderForm.components.find(
                      (c) => c.key === element.founderField
                    ) as FormComponent
                  }
                />
                <Accordion type="single" collapsible>
                  <AccordionItem
                    value={element.founderField}
                    className="border-none"
                  >
                    <AccordionTrigger className="text-sm flex items-center gap-2 justify-start">
                      <List size={16} /> Match Options
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="col-span-3">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-8">
                            <Select
                              value={element.matchType}
                              onValueChange={(value) => {
                                handleUpdateMatchCriteria(
                                  element.founderField,
                                  element.investorField,
                                  { matchType: value as MatchType }
                                );
                              }}
                            >
                              <SelectTrigger className="[&_[data-desc]]:hidden">
                                <SelectValue placeholder="Select a Match Type" />
                              </SelectTrigger>
                              <SelectContent className="[&_*[role=option]>span]:end-2 [&_*[role=option]>span]:start-auto [&_*[role=option]]:pe-8 [&_*[role=option]]:ps-2">
                                <SelectItem
                                  key={MatchType.EXACT}
                                  value={MatchType.EXACT}
                                >
                                  Exact Match
                                  <span
                                    className="mt-1 block text-xs text-muted-foreground"
                                    data-desc
                                  >
                                    All values must match exactly
                                  </span>
                                </SelectItem>
                                <SelectItem
                                  key={MatchType.SOFT}
                                  value={MatchType.SOFT}
                                >
                                  Soft Match
                                  <span
                                    className="mt-1 block text-xs text-muted-foreground"
                                    data-desc
                                  >
                                    Similar values increase compatibility
                                  </span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="flex items-center gap-2">
                              <Label
                                htmlFor="weight"
                                className="text-sm font-normal"
                              >
                                Weight:
                              </Label>
                              <input
                                value={element.weight}
                                onChange={(e) => {
                                  handleUpdateMatchCriteria(
                                    element.founderField,
                                    element.investorField,
                                    { weight: parseFloat(e.target.value) }
                                  );
                                }}
                                type="number"
                                min={0}
                                max={1}
                                step={0.1}
                                className="border-0 shadow-none bg-transparent text-sm font-normal rounded-sm p-1.5 outline-none focus:outline-gray-200 focus:ring-0"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`${element.founderField}-${element.investorField}-required`}
                              checked={element.required || false}
                              onCheckedChange={(checked) => {
                                handleUpdateMatchCriteria(
                                  element.founderField,
                                  element.investorField,
                                  { required: checked === true }
                                );
                              }}
                            />
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Label
                                    htmlFor={`${element.founderField}-${element.investorField}-required`}
                                    className="text-sm font-normal"
                                  >
                                    {"Required for match"}
                                  </Label>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="bottom"
                                  className="bg-black/70 text-white"
                                >
                                  <p>
                                    If this field is not met, the match will be
                                    rejected.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className="flex-1 flex justify-end">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setMatchCriteriaData(
                                  matchCriteriaData.filter(
                                    (c) =>
                                      c.founderField !== element.founderField
                                  )
                                );
                              }}
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* Connection Line */}
              <div className="flex items-center justify-center relative py-8">
                <svg width="40" height="24" className="text-gray-400">
                  <circle cx="3" cy="12" r="3" className="fill-current" />
                  <line
                    x1="3"
                    y1="12"
                    x2="37"
                    y2="12"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <circle cx="37" cy="12" r="3" className="fill-current" />
                </svg>
                <Zap
                  size={14}
                  strokeWidth={0}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 fill-gray-800 bg-white"
                />
              </div>

              <div className="w-full">
                <FieldPreview
                  component={
                    investorForm.components.find(
                      (c) => c.key === element.investorField
                    ) as FormComponent
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FieldPreview({ component }: { component: FormComponent }) {
  return (
    <div className="flex-1 border border-gray-200 rounded-md p-4 min-h-24">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex-1">
          {component.type !== "button" && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex justify-between w-full h-full items-center">
                    <div className="w-full">
                      {/* Field Label */}
                      <div className="flex justify-between items-center">
                        <Label>
                          {component.label}
                          {component.validate?.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </Label>
                        <div className="flex items-center gap-2">
                          {component.isPersonality && (
                            <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 border border-green-200 rounded-md">
                              <User size={12} className="text-green-700" />
                              Personality
                            </div>
                          )}
                          <p className="text-xs text-gray-500">
                            {
                              AVAILABLE_COMPONENTS.find(
                                (c) => c.type === component.type
                              )?.label
                            }
                          </p>
                        </div>
                      </div>
                      {component.description && (
                        <p className="text-xs text-gray-800 font-light mr-8 py-2">
                          {component.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <PreviewFormField component={component} collapsed={true} />
    </div>
  );
}

function NewMatchCriteria({
  founderComponents,
  investorComponents,
  show,
  onClose,
  handleAddMatchCriteria,
}: {
  founderComponents: FormComponent[];
  investorComponents: FormComponent[];
  show: boolean;
  onClose: (value?: boolean) => void;
  handleAddMatchCriteria: (newMatchCriteria: {
    founderField: string;
    investorField: string;
  }) => void;
}) {
  useEffect(() => {
    setNewMatchCriteria({
      founder: null,
      investor: null,
    });
  }, [show]);

  const [newMatchCriteria, setNewMatchCriteria] = useState<{
    founder: FormComponent | null;
    investor: FormComponent | null;
  }>({
    founder: null,
    investor: null,
  });

  const validFields = AVAILABLE_COMPONENTS.filter(
    (c) => c.type !== "button" && c.type !== "file"
  );

  const getCompatibleComponents = (component: FormComponent) => {
    return investorComponents.filter((c) => {
      if (
        OptionsComponentType.includes(c.type) &&
        OptionsComponentType.includes(component.type)
      ) {
        if (
          JSON.stringify(getComponentOptions(c as OptionsComponent)) ===
          JSON.stringify(getComponentOptions(component as OptionsComponent))
        ) {
          return true;
        }
      } else if (c.type === component.type) {
        return true;
      }
      return false;
    });
  };

  const handleMatchCriteriaChange = (componentKey: string) => {
    const compatibleComponents = getCompatibleComponents(
      founderComponents.find((c) => c.key === componentKey) as FormComponent
    );

    if (compatibleComponents.length === 1) {
      setNewMatchCriteria({
        founder: founderComponents.find(
          (c) => c.key === componentKey
        ) as FormComponent,
        investor: compatibleComponents[0],
      });
    } else {
      setNewMatchCriteria({
        founder: founderComponents.find(
          (c) => c.key === componentKey
        ) as FormComponent,
        investor: null,
      });
    }
  };

  let disabled = false;
  if (
    !founderComponents.filter((c) =>
      validFields.map((f) => f.type).includes(c.type as any)
    ) ||
    !investorComponents.filter((c) =>
      validFields.map((f) => f.type).includes(c.type as any)
    ).length
  ) {
    disabled = true;
  }

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogTrigger asChild>
        <Button
          disabled={disabled}
          onClick={() => {
            onClose(true);
          }}
          variant="outline"
          size="sm"
          className="gap-2 flex p-4"
        >
          <Plus size={16} />
          New Match Criteria
        </Button>
      </DialogTrigger>
      <DialogContent showClose={true}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap size={16} /> New Match Element
          </DialogTitle>
        </DialogHeader>
        <Form className="grid gap-4" method="post" noValidate>
          <Label>Founder Field</Label>
          <Select
            onValueChange={(value) => {
              handleMatchCriteriaChange(value);
            }}
            value={newMatchCriteria.founder?.key}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a Founder Field" />
            </SelectTrigger>
            <SelectContent>
              {founderComponents
                .filter((c) =>
                  validFields.map((f) => f.type).includes(c.type as any)
                )
                .map((component) => (
                  <SelectItem key={component.key} value={component.key}>
                    {component.label}
                  </SelectItem>
                ))}
            </SelectContent>
            <input
              type="hidden"
              name="founderField"
              value={newMatchCriteria.founder?.key}
            />
          </Select>
          <Label>Investor Field</Label>
          <Select
            disabled={!newMatchCriteria.founder}
            value={newMatchCriteria.investor?.key}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an Investor Field" />
            </SelectTrigger>
            <SelectContent>
              {newMatchCriteria.founder &&
                getCompatibleComponents(newMatchCriteria.founder)
                  .filter((c) =>
                    validFields.map((f) => f.type).includes(c.type as any)
                  )
                  .map((component) => (
                    <SelectItem key={component.key} value={component.key}>
                      {component.label}
                    </SelectItem>
                  ))}
            </SelectContent>
            <input
              type="hidden"
              name="investorField"
              value={newMatchCriteria.investor?.key}
            />
          </Select>
          <DialogFooter className="mt-4">
            <Button
              type="submit"
              size="sm"
              onClick={() => {
                if (!newMatchCriteria.founder || !newMatchCriteria.investor) {
                  return;
                }
                handleAddMatchCriteria({
                  founderField: newMatchCriteria.founder.key,
                  investorField: newMatchCriteria.investor.key,
                });
                onClose(false);
              }}
              disabled={!newMatchCriteria.founder || !newMatchCriteria.investor}
            >
              Add Match Element
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
