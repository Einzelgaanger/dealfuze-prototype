import {
  FormComponent as FormioComponent,
  NumberComponent,
  FileComponent,
  CheckboxComponent,
} from "@deal-fuze/server";
import { NumberEditor } from "./number-editor";
import { FileEditor } from "./file-editor";
import { DefaultEditor } from "./default-editor";
import { CheckBoxEditor } from "./checkbox";
import {
  OptionsComponent,
  OptionsComponentEditor,
} from "./options-component-editor";

interface EditorProps<T extends FormioComponent> {
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
}

export function ComponentEditor<T extends FormioComponent>({
  component,
  isMatching,
  onSave,
  compatibleComponents = [],
}: EditorProps<T>) {
  switch (component.type) {
    case "number":
      return (
        <NumberEditor
          isMatching={isMatching}
          component={component as NumberComponent}
          onSave={({ component, matching }) =>
            onSave({
              component: component as T,
              matching: matching,
            })
          }
          compatibleComponents={compatibleComponents}
        />
      );
    case "select":
    case "selectboxes":
    case "radio":
      return (
        <OptionsComponentEditor
          isMatching={isMatching}
          component={component as OptionsComponent}
          onSave={({ component, matching }) =>
            onSave({
              component: component as T,
              matching: matching,
            })
          }
          compatibleComponents={compatibleComponents}
        />
      );
    case "file":
      return (
        <FileEditor
          isMatching={isMatching}
          component={component as FileComponent}
          onSave={({ component }) =>
            onSave({
              component: component as T,
            })
          }
          compatibleComponents={compatibleComponents}
        />
      );
    case "checkbox":
      return (
        <CheckBoxEditor
          isMatching={isMatching}
          component={component as CheckboxComponent}
          onSave={({ component, matching }) =>
            onSave({
              component: component as T,
              matching: matching,
            })
          }
          compatibleComponents={compatibleComponents}
        />
      );
    default:
      return (
        <DefaultEditor
          isMatching={isMatching}
          component={component}
          onSave={({ component, matching }) =>
            onSave({
              component: component as T,
              matching: matching,
            })
          }
          compatibleComponents={compatibleComponents}
        />
      );
  }
}
