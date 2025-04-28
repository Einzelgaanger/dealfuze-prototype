import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { RadioComponent } from "@deal-fuze/server";
import {
  BaseEditor,
  DefaultElements,
  ComponentEditorProps,
} from "./base-editor";
import { useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectValue,
  SelectTrigger,
  SelectItem,
} from "@/components/ui/select";
import { OptionsComponentEditorProps } from "./options-component-editor";

export function RadioEditor({
  component,
  isMatching,
  onSave,
  onChangeType,
  compatibleComponents = [],
}: OptionsComponentEditorProps<RadioComponent>) {
  const [currentTab, setCurrentTab] = useState<"display" | "data">("display");
  const optionsRef = useRef<HTMLDivElement>(null);
  const [currentComponent, setCurrentComponent] = useState<{
    component: RadioComponent;
    matching?: boolean;
  }>({
    component: component as RadioComponent,
    matching: isMatching,
  });

  const convertedComponent = component as RadioComponent;

  const addOption = () => {
    setCurrentComponent({
      ...currentComponent,
      component: {
        ...currentComponent.component,
        values: [
          ...(convertedComponent.values ?? []),
          { label: "New Option", value: "new_option" },
        ],
      },
    });

    setTimeout(() => {
      optionsRef.current?.scrollTo({
        top: optionsRef.current?.scrollHeight,
        behavior: "instant",
      });
    }, 0);
  };

  const removeOption = (index: number) => {
    const values = [...(convertedComponent.values ?? [])];
    values.splice(index, 1);
    setCurrentComponent({
      ...currentComponent,
      component: {
        ...currentComponent.component,
        values,
      },
    });
  };

  const updateOption = (
    index: number,
    field: "label" | "value",
    value: string
  ) => {
    const values = [...(convertedComponent.values || [])];
    values[index] = { ...values[index], [field]: value };
    setCurrentComponent({
      ...currentComponent,
      component: {
        ...currentComponent.component,
        values,
      },
    });
  };

  return (
    <BaseEditor
      currentComponent={
        currentComponent as {
          component: RadioComponent;
          personality?: boolean;
          matching?: boolean;
        }
      }
      setCurrentComponent={(value) => {
        if ("component" in value) {
          setCurrentComponent(
            value as {
              component: RadioComponent;
              personality?: boolean;
              matching?: boolean;
            }
          );
        } else {
          setCurrentComponent(value);
        }
      }}
      onSave={(value) => {
        onSave(
          value as {
            component: RadioComponent;
            personality?: boolean;
            matching?: boolean;
          }
        );
      }}
      options={{
        showDefaultElements: false,
        allowSetPersonality: true,
        allowSetMatching: true,
      }}
      compatibleComponents={compatibleComponents}
      className="min-h-[800px]"
      nav={
        <div className="flex gap-4">
          <div className="space-y-2 pr-4">
            <Button
              variant={currentTab === "display" ? "secondary" : "ghost"}
              className="w-full justify-start text-xs"
              onClick={() => setCurrentTab("display")}
            >
              Display
            </Button>
            <Button
              variant={currentTab === "data" ? "secondary" : "ghost"}
              className="w-full justify-start text-xs"
              onClick={() => setCurrentTab("data")}
            >
              Data
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex-1">
        {currentTab === "display" && (
          <div className="flex flex-col gap-4">
            <DefaultElements
              component={currentComponent}
              onUpdateComponent={(component) => setCurrentComponent(component)}
            />
            <div className="flex flex-col gap-2 mt-4">
              <Label>Change Component Type</Label>
              <Select
                value={currentComponent.component.type}
                onValueChange={(value) =>
                  onChangeType(value as "select" | "selectboxes" | "radio")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select component type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="select">Dropdown</SelectItem>
                  <SelectItem value="selectboxes">Checkboxes</SelectItem>
                  <SelectItem value="radio">Radio</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 pb-2">
                This will change the component type, some component-specific
                validation will be lost. Different option components can still
                be used for matching.
              </p>
            </div>
          </div>
        )}
        {currentTab === "data" && (
          <div>
            <div className="flex justify-between items-center pb-4">
              <Label className="text-lg">Options</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Option
              </Button>
            </div>
            <div className="flex gap-2 sticky top-0 bg-background py-2 border-b">
              <div className="flex-1">
                <Label>Label</Label>
              </div>
              <div className="flex-1">
                <Label>Value</Label>
              </div>
              <div className="w-12"></div>
            </div>
            <ScrollArea
              ref={optionsRef}
              className="overflow-y-auto max-h-[40vh] bg-background"
            >
              {convertedComponent.values?.map((option, index) => (
                <div key={index} className="flex gap-2 pt-4">
                  <Input
                    className="flex-1"
                    value={option.label}
                    onChange={(e) =>
                      updateOption(index, "label", e.target.value)
                    }
                  />
                  <Input
                    className="flex-1"
                    value={option.value}
                    onChange={(e) =>
                      updateOption(index, "value", e.target.value)
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </ScrollArea>
          </div>
        )}
      </div>
    </BaseEditor>
  );
}
