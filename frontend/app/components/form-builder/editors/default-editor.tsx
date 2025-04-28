import { useState } from "react";
import { Component as FormioComponent } from "@deal-fuze/server";
import { BaseEditor, ComponentEditorProps } from "./base-editor";

export function DefaultEditor(props: ComponentEditorProps<FormioComponent>) {
  const [currentComponent, setCurrentComponent] = useState<{
    component: FormioComponent;
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
    />
  );
}
