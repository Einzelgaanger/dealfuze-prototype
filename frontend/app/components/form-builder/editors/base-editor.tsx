import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TextArea } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FormComponent as FormioComponent } from "@deal-fuze/server";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TooltipContent,
  Tooltip,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TooltipProvider } from "@/components/ui/tooltip";
import React, { useState, useEffect } from "react";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useRef } from "react";
export type ComponentEditorProps<T extends FormioComponent> = {
  component: T;
  isMatching: boolean;
  onSave: ({
    component,
    matching,
  }: {
    component: T;
    matching?: boolean;
  }) => void;
  compatibleComponents?: { key: string; label: string }[];
};

interface BaseEditorProps<T extends FormioComponent> {
  currentComponent: {
    component: T;
    matching?: boolean;
    matchTo?: string;
  };
  setCurrentComponent: React.Dispatch<
    React.SetStateAction<{
      component: T;
      matching?: boolean;
      matchTo?: string;
    }>
  >;
  trigger?: React.ReactNode;
  onSave: ({
    component,
    matching,
    matchTo,
  }: {
    component: T;
    matching?: boolean;
    matchTo?: string;
  }) => void;
  children?: React.ReactNode;
  nav?: React.ReactNode;
  showDefaultElements?: boolean;
  className?: string;
  options?: {
    showDefaultElements?: boolean;
    allowSetPersonality?: boolean;
    allowSetMatching?: boolean;
    showPlaceholder?: boolean;
  };
  compatibleComponents?: { key: string; label: string }[];
}

const defaultOptions = {
  showDefaultElements: true,
  allowSetPersonality: true,
  allowSetMatching: true,
  showPlaceholder: true,
};

export function BaseEditor<T extends FormioComponent>({
  currentComponent,
  setCurrentComponent,
  trigger,
  onSave,
  children,
  nav,
  className,
  options,
  compatibleComponents = [],
}: BaseEditorProps<T>) {
  const prevComponent = useRef(currentComponent);
  const opts = { ...defaultOptions, ...options };
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (isDialogOpen) {
      setCurrentComponent(currentComponent);
    } else {
      prevComponent.current = currentComponent;
    }
  }, [currentComponent, isDialogOpen]);

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={() => {
        setCurrentComponent(prevComponent.current);
        setIsDialogOpen(!isDialogOpen);
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <button onClick={() => setIsDialogOpen(true)}>
            <Edit size={16} />
          </button>
        )}
      </DialogTrigger>
      <DialogContent
        className={cn(
          "max-w-3xl",
          className,
          "flex flex-col items-start gap-8 justify-between"
        )}
      >
        <div className="w-full h-full flex flex-col gap-10">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <Edit size={16} /> Edit Component
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex gap-4 w-full h-full">
            <div>{nav}</div>
            <div className="w-full h-full flex flex-col gap-4">
              {opts.showDefaultElements && (
                <DefaultElements
                  showPlaceholder={opts.showPlaceholder}
                  component={currentComponent}
                  allowSetMatching={opts.allowSetMatching}
                  onUpdateComponent={(component) =>
                    setCurrentComponent({
                      ...component,
                    })
                  }
                  compatibleComponents={compatibleComponents}
                />
              )}
              {children}
            </div>
          </div>
        </div>
        <DialogFooter className="w-full">
          <div className="flex justify-end pt-10 gap-6">
            {opts.allowSetPersonality && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="personality"
                  checked={currentComponent.component.isPersonality}
                  onCheckedChange={(checked) => {
                    setCurrentComponent({
                      ...currentComponent,
                      component: {
                        ...currentComponent.component,
                        isPersonality: checked as boolean,
                      },
                    });
                  }}
                />
                <TooltipProvider>
                  <Tooltip delayDuration={50}>
                    <TooltipTrigger>
                      <Label htmlFor="personality" className="text-sm">
                        Use for Personality
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Allow this data to be used in the AI personality
                        profile.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
            {opts.allowSetMatching && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="matching"
                  checked={currentComponent.matching}
                  onCheckedChange={(checked) =>
                    setCurrentComponent({
                      ...currentComponent,
                      matching: checked as boolean,
                    })
                  }
                />
                <TooltipProvider>
                  <Tooltip delayDuration={50}>
                    <TooltipTrigger>
                      <Label htmlFor="matching" className="text-sm">
                        Use for Matching
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Field will be added to both forms.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Checkbox
                id="required"
                checked={currentComponent.component.validate?.required || false}
                onCheckedChange={(checked) =>
                  setCurrentComponent({
                    ...currentComponent,
                    component: {
                      ...currentComponent.component,
                      validate: {
                        ...currentComponent.component.validate,
                        required: checked as boolean,
                      },
                    },
                  })
                }
              />
              <Label htmlFor="required">Required</Label>
            </div>
            <Button
              onClick={() => {
                onSave(currentComponent);
                setIsDialogOpen(false);
              }}
            >
              Done
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DefaultElements<T extends FormioComponent>({
  component,
  onUpdateComponent,
  showPlaceholder = true,
  allowSetMatching = true,
  compatibleComponents = [],
}: {
  component: {
    component: T;
    matching?: boolean;
    matchTo?: string;
  };
  onUpdateComponent: (component: {
    component: T;
    matching?: boolean;
    matchTo?: string;
  }) => void;
  showPlaceholder?: boolean;
  allowSetMatching?: boolean;
  compatibleComponents?: { key: string; label: string }[];
}) {
  return (
    <>
      <div>
        <Label>Label</Label>
        <Input
          value={component.component.label}
          onChange={(e) =>
            onUpdateComponent({
              ...component,
              component: {
                ...component.component,
                label: e.target.value,
              },
            })
          }
        />
      </div>
      <div>
        <Label>Description</Label>
        <TextArea
          value={component.component.description || ""}
          placeholder="Enter a description for this field"
          onChange={(e) =>
            onUpdateComponent({
              ...component,
              component: {
                ...component.component,
                description: e.target.value,
              },
            })
          }
        />
        <p className="text-xs text-gray-500 mt-1">
          The description will appear below the field label
        </p>
      </div>
      {showPlaceholder && (
        <div>
          <Label>Placeholder</Label>
          <Input
            value={component.component.placeholder || ""}
            onChange={(e) =>
              onUpdateComponent({
                ...component,
                component: {
                  ...component.component,
                  placeholder: e.target.value,
                },
              })
            }
          />
        </div>
      )}
      {/*
      {allowSetMatching && (
        <div>
          <Label>Match to</Label>
          <Select
            onValueChange={(value) => {
              onUpdateComponent({
                ...component,
                matchTo: value === "none" ? undefined : value,
                matching: value !== "none",
              });
            }}
            defaultValue={component.matchTo}
            disabled={!compatibleComponents.length}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  compatibleComponents.length
                    ? "Select a field"
                    : "No compatible fields"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="text-gray-500" value="none">
                None
              </SelectItem>
              {compatibleComponents.map((component) => (
                <SelectItem key={component.key} value={component.key}>
                  {component.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}*/}
    </>
  );
}
