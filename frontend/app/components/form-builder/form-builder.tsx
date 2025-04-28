import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Check, Eye, GripVertical, Plus, Trash, User, Zap } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  FormComponent as FormioComponent,
  RadioComponent,
  SelectComponent,
  SelectBoxesComponent,
  NumberComponent,
  FileComponent,
  UrlComponent,
  FormType,
  FormDocument,
} from "@deal-fuze/server";
import { ComponentEditor } from "./editors";
import { PreviewFormField } from "./preview-field";
import { Combobox } from "../combobox";
import {
  TooltipTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useMemo, useState } from "react";
import { MatchCriteria } from "../../../../server/src/types/matchCriteria";
import { Button } from "../ui/button";
import { Link } from "@remix-run/react";

// FormIO component types we support
type SupportedFormIOTypes =
  | "textfield"
  | "textarea"
  | "select"
  | "selectboxes"
  | "radio"
  | "checkbox"
  | "email"
  | "day"
  | "number"
  | "button"
  | "file"
  | "url"
  | "linkedinurl";

// Helper type for components that can have options
type ComponentWithOptions =
  | RadioComponent
  | SelectComponent
  | SelectBoxesComponent;

export const REQUIRED_COMPONENTS = ["name", "email"];

export const AVAILABLE_COMPONENTS: {
  type: SupportedFormIOTypes;
  label: string;
}[] = [
  { type: "textfield", label: "Text Field" },
  { type: "textarea", label: "Text Area" },
  { type: "number", label: "Number" },
  { type: "select", label: "Select" },
  { type: "selectboxes", label: "Multi-Select" },
  { type: "radio", label: "Radio" },
  { type: "checkbox", label: "Checkbox" },
  { type: "email", label: "Email" },
  { type: "day", label: "Date" },
  { type: "file", label: "File Upload" },
  { type: "url", label: "URL" },
  { type: "linkedinurl", label: "LinkedIn URL" },
];

export interface FormBuilderData {
  investor: FormDocument;
  founder: FormDocument;
  matching: MatchCriteria["matchCriteria"];
}

interface FormBuilderProps {
  data: FormBuilderData;
  setData: (data: FormBuilderData) => void;
  formType: FormType;
}

export function FormBuilder({ data, setData, formType }: FormBuilderProps) {
  const thisForm = useMemo(
    () => (formType === FormType.INVESTOR ? data.investor : data.founder),
    [data]
  );
  const pairedForm = useMemo(
    () => (formType === FormType.INVESTOR ? data.founder : data.investor),
    [data]
  );
  const [pairAddedComponents, setPairAddedComponents] = useState<string[]>([]);

  const matchCriteria = new MatchCriteria(data.matching);

  const handleAddComponent = (type: SupportedFormIOTypes) => {
    const baseComponent: Partial<FormioComponent> = {
      type: type === "linkedinurl" ? "url" : type,
      key: type === "linkedinurl" ? `linkedinurl` : `${type}_${Date.now()}`,
      label: `${AVAILABLE_COMPONENTS.find((c) => c.type === type)?.label}`,
      input: true,
      tableView: true,
      isPersonality: false,
    };

    // Add type-specific properties
    let newComponent: FormioComponent;
    switch (type) {
      case "select":
        newComponent = {
          ...baseComponent,
          data: {
            values: [],
          },
        } as ComponentWithOptions;
        break;
      case "radio":
      case "selectboxes":
        newComponent = {
          ...baseComponent,
          values: [],
        } as ComponentWithOptions;
        break;
      case "number":
        newComponent = {
          ...baseComponent,
          validate: {
            min: undefined,
            max: undefined,
            step: "any",
          },
        } as NumberComponent;
        break;
      case "file":
        newComponent = {
          ...baseComponent,
          image: false,
          privateDownload: false,
          filePattern: "*",
          fileMinSize: "0KB",
          fileMaxSize: "10MB",
          uploadOnly: false,
        } as FileComponent;
        break;
      case "url":
      case "linkedinurl":
        newComponent = {
          ...baseComponent,
        } as UrlComponent;
        break;
      default:
        newComponent = baseComponent as FormioComponent;
    }

    const updatedForm = {
      ...thisForm,
      components: [...thisForm.components, newComponent],
    };

    setData({
      ...data,
      [formType]: updatedForm,
    });
  };

  const handleDeleteComponent = (key: string) => {
    const updatedForm = {
      ...thisForm,
      components: thisForm.components.filter((c) => c.key !== key),
    };

    const updatedMatching = new MatchCriteria(data.matching);
    if (matchCriteria.hasField(key)) {
      updatedMatching.removeField(key);
    }

    setData({
      ...data,
      [formType]: updatedForm,
      matching: updatedMatching.matchCriteria,
    });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const components = Array.from(thisForm.components);
    const [reorderedItem] = components.splice(result.source.index, 1);
    components.splice(result.destination.index, 0, reorderedItem);

    setData({
      ...data,
      [formType]: { ...thisForm, components },
    });
  };

  const handleUpdateComponent = ({
    component,
    matching,
    matchTo,
  }: {
    component: FormioComponent;
    matching?: boolean;
    matchTo?: string;
  }) => {
    const updatedData = { ...data };

    // If matching and matchTo, update the paired form component key to be the same
    if (matching && matchTo) {
      updatedData[pairedForm.submitterType].components =
        pairedForm.components.map((c) =>
          c.key === matchTo ? { ...c, key: component.key } : c
        );
    }

    const updatedMatchCriteria = new MatchCriteria(matchCriteria.matchCriteria);

    // If matching, add the component to the paired form if it doesn't exist
    if (matching) {
      if (!matchCriteria.hasField(component.key)) {
        updatedData[pairedForm.submitterType].components = updatedData[
          pairedForm.submitterType
        ].components.find((c) => c.key === component.key)
          ? updatedData[pairedForm.submitterType].components
          : [...updatedData[pairedForm.submitterType].components, component];

        updatedMatchCriteria.addField(component.key);
      }
    }

    // If not matching, remove the component from the matching array
    if (!matching) {
      if (matchCriteria.hasField(component.key)) {
        updatedMatchCriteria.removeField(component.key);
      }
    }

    // Update the current form component
    updatedData[formType].components = thisForm.components.map((c) =>
      c.key === component.key ? component : c
    );

    setData({
      ...updatedData,
      matching: updatedMatchCriteria.matchCriteria,
    });
  };

  const handleAddPairedComponent = (component: FormioComponent) => {
    setPairAddedComponents([...pairAddedComponents, component.key]);

    setData({
      ...data,
      [pairedForm.submitterType]: {
        ...pairedForm,
        components: [...pairedForm.components, component],
      },
    });
  };

  return (
    <div>
      <div className="flex justify-between px-4 items-end">
        <h3 className="text-lg font-semibold">{thisForm.name}</h3>
        <div className="w-fit pl-4 flex gap-2">
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger>
                <Link
                  to={`/pipeline/${thisForm.pipelineId}/form/${thisForm._id}`}
                  className="text-xs text-gray-700 hover:text-gray-800 hover:underline"
                >
                  <Button variant="outline" size="icon">
                    <Eye size={16} />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Preview Form</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Combobox
            options={AVAILABLE_COMPONENTS.map(({ type, label }) => ({
              value: type,
              label,
            }))}
            onChange={(value) =>
              handleAddComponent(value as SupportedFormIOTypes)
            }
          />
        </div>
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="form-components">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="min-h-[200px] p-4 rounded-lg bg-white space-y-4"
            >
              <div className="space-y-4">
                {thisForm.components.map((component, index) => (
                  <Draggable
                    key={component.key}
                    draggableId={component.key}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`relative flex gap-2 py-4 pr-4 pl-2 pb-6 rounded-md border shadow-sm ${
                          snapshot.isDragging ? "bg-gray-100" : "bg-white"
                        }`}
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="flex items-center self-stretch px-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing touch-none"
                        >
                          <GripVertical className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex-1">
                              {component.type !== "button" && (
                                <>
                                  <div className="flex items-center justify-between">
                                    <div className="flex flex-col gap-2 w-full">
                                      <div className="flex justify-between w-full h-full items-center">
                                        <div className="w-full">
                                          {/* Field Label */}
                                          <p className="text-xs text-gray-500">
                                            {
                                              AVAILABLE_COMPONENTS.find(
                                                (c) => c.type === component.type
                                              )?.label
                                            }
                                          </p>
                                          <Label>
                                            {component.label}
                                            {component.validate?.required && (
                                              <span className="text-red-500 ml-1">
                                                *
                                              </span>
                                            )}
                                          </Label>
                                          {component.description && (
                                            <p className="text-xs text-gray-800 font-light mr-8 py-2">
                                              {component.description}
                                            </p>
                                          )}
                                        </div>
                                        <div className="h-full place-self-start flex flex-col gap-3">
                                          <div className="flex gap-3 justify-end">
                                            {!pairedForm.components.find(
                                              (c) => c.key === component.key
                                            ) && (
                                              <TooltipProvider>
                                                <Tooltip delayDuration={200}>
                                                  <TooltipTrigger>
                                                    <button
                                                      className="size-4 flex items-center"
                                                      onClick={() =>
                                                        handleAddPairedComponent(
                                                          component
                                                        )
                                                      }
                                                    >
                                                      <Plus size={16} />
                                                    </button>
                                                  </TooltipTrigger>
                                                  <TooltipContent>
                                                    <p>
                                                      Add to{" "}
                                                      {pairedForm.submitterType}{" "}
                                                      form
                                                    </p>
                                                  </TooltipContent>
                                                </Tooltip>
                                              </TooltipProvider>
                                            )}
                                            {pairedForm.components.find(
                                              (c) => c.key === component.key
                                            ) &&
                                              pairAddedComponents.includes(
                                                component.key
                                              ) &&
                                              !matchCriteria.hasField(
                                                component.key
                                              ) && (
                                                <Check
                                                  color="darkgreen"
                                                  size={16}
                                                />
                                              )}
                                            <ComponentEditor
                                              component={component}
                                              isMatching={matchCriteria.hasField(
                                                component.key
                                              )}
                                              onSave={handleUpdateComponent}
                                            />
                                            {!REQUIRED_COMPONENTS.includes(
                                              component.key
                                            ) && (
                                              <button
                                                onClick={() =>
                                                  handleDeleteComponent(
                                                    component.key
                                                  )
                                                }
                                              >
                                                <Trash size={16} />
                                              </button>
                                            )}
                                          </div>
                                          {/* Matching/Personality Badges */}
                                          <div className="flex gap-2 mb-1">
                                            {matchCriteria.hasField(
                                              component.key
                                            ) && (
                                              <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-md">
                                                <Zap
                                                  size={12}
                                                  className="text-blue-700"
                                                />
                                                Matching
                                              </div>
                                            )}
                                            {component.isPersonality && (
                                              <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 border border-green-200 rounded-md">
                                                <User
                                                  size={12}
                                                  className="text-green-700"
                                                />
                                                Personality
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                          <PreviewFormField component={component} />
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
              </div>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
