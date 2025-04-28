import {
  SelectComponent,
  RadioComponent,
  SelectBoxesComponent,
} from "@deal-fuze/server";
import { SelectEditor } from "./select";
import { RadioEditor } from "./radio-editor";
import { SelectBoxesEditor } from "./selectboxes-editor";
import { useState } from "react";
import { ComponentEditorProps } from "./base-editor";

export const OptionsComponentType = ["select", "selectboxes", "radio"];

export type OptionsComponent =
  | SelectComponent
  | RadioComponent
  | SelectBoxesComponent;

export interface OptionsComponentEditorProps<T extends OptionsComponent>
  extends ComponentEditorProps<T> {
  onChangeType: (type: "select" | "selectboxes" | "radio") => void;
}

export function getComponentOptions(component: OptionsComponent) {
  switch (component.type) {
    case "select":
      return (component as SelectComponent).data;
    case "selectboxes":
      return (component as SelectBoxesComponent).values;
    case "radio":
      return (component as RadioComponent).values;
    default:
      return [];
  }
}

export function OptionsComponentEditor({
  component,
  isMatching,
  onSave,
  compatibleComponents = [],
}: ComponentEditorProps<OptionsComponent>) {
  const [componentType, setComponentType] = useState(component.type);

  const handleTypeChange = (newType: string) => {
    // Convert the current component to the new type while preserving options
    const values =
      component.type === "select"
        ? (
            (component as SelectComponent).data as {
              values: { label: string; value: string }[];
            }
          ).values || []
        : (component as SelectBoxesComponent | RadioComponent).values || [];

    let newComponent: OptionsComponent;

    switch (newType) {
      case "select":
        newComponent = {
          ...component,
          type: "select",
          data: { values },
        } as SelectComponent;
        break;
      case "selectboxes":
        newComponent = {
          ...component,
          type: "selectboxes",
          values,
        } as SelectBoxesComponent;
        break;
      case "radio":
        newComponent = {
          ...component,
          type: "radio",
          values,
        } as RadioComponent;
        break;
      default:
        return;
    }

    setComponentType(newType);
    onSave({
      component: newComponent,
      matching: isMatching,
    });
  };

  return (
    <>
      {componentType === "select" && (
        <SelectEditor
          onChangeType={handleTypeChange}
          component={component as SelectComponent}
          onSave={onSave}
          isMatching={isMatching}
          compatibleComponents={compatibleComponents}
        />
      )}
      {componentType === "selectboxes" && (
        <SelectBoxesEditor
          onChangeType={handleTypeChange}
          component={component as SelectBoxesComponent}
          onSave={onSave}
          isMatching={isMatching}
          compatibleComponents={compatibleComponents}
        />
      )}
      {componentType === "radio" && (
        <RadioEditor
          onChangeType={handleTypeChange}
          component={component as RadioComponent}
          onSave={onSave}
          isMatching={isMatching}
          compatibleComponents={compatibleComponents}
        />
      )}
    </>
  );
}
