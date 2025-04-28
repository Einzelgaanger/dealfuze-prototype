import { useState } from "react";
import { CheckboxComponent } from "@formio/core";
import { BaseEditor, ComponentEditorProps } from "./base-editor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CheckBoxEditor(props: ComponentEditorProps<CheckboxComponent>) {
  const [currentComponent, setCurrentComponent] = useState<{
    component: CheckboxComponent;
    matching?: boolean;
  }>({
    component: props.component,
    matching: false,
  });
  return (
    <BaseEditor
      currentComponent={currentComponent}
      setCurrentComponent={setCurrentComponent}
      {...props}
    >
      <div>
        <Label>Name</Label>
        <Input
          value={currentComponent.component.name || ""}
          onChange={(e) =>
            setCurrentComponent({
              ...currentComponent,
              component: {
                ...currentComponent.component,
                name: e.target.value,
              },
            })
          }
        />
      </div>
    </BaseEditor>
  );
}
