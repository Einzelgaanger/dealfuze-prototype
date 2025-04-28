import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NumberComponent } from "@deal-fuze/server";
import { BaseEditor, ComponentEditorProps } from "./base-editor";
import { useState } from "react";

export function NumberEditor(props: ComponentEditorProps<NumberComponent>) {
  const [currentComponent, setCurrentComponent] = useState<{
    component: NumberComponent;
    matching?: boolean;
  }>({
    component: props.component,
    matching: props.isMatching,
  });

  return (
    <BaseEditor
      currentComponent={currentComponent}
      setCurrentComponent={setCurrentComponent}
      {...props}
    >
      <div className="space-y-4">
        <div>
          <Label>Minimum Value</Label>
          <Input
            type="number"
            value={currentComponent.component.validate?.min || ""}
            onChange={(e) =>
              setCurrentComponent({
                ...currentComponent,
                component: {
                  ...currentComponent.component,
                  validate: {
                    ...currentComponent.component.validate,
                    min: e.target.value ? Number(e.target.value) : undefined,
                  },
                },
              })
            }
          />
        </div>
        <div>
          <Label>Maximum Value</Label>
          <Input
            type="number"
            value={currentComponent.component.validate?.max || ""}
            onChange={(e) =>
              setCurrentComponent({
                ...currentComponent,
                component: {
                  ...currentComponent.component,
                  validate: {
                    ...currentComponent.component.validate,
                    max: e.target.value ? Number(e.target.value) : undefined,
                  },
                },
              })
            }
          />
        </div>
      </div>
    </BaseEditor>
  );
}
