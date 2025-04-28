import {
  Component as FormioComponent,
  RadioComponent,
  SelectComponent,
  SelectBoxesComponent,
  TextFieldComponent,
  NumberComponent,
  FileComponent,
  UrlComponent,
  TextAreaComponent,
  CheckboxComponent,
  EmailComponent,
  DayComponent,
} from "@formio/core";

export function convertComponent(component: FormioComponent) {
  switch (component.type) {
    case "textfield":
      return component as TextFieldComponent;
    case "textarea":
      return component as TextAreaComponent;
    case "number":
      return component as NumberComponent;
    case "select":
      return component as SelectComponent;
    case "selectboxes":
      return component as SelectBoxesComponent;
    case "radio":
      return component as RadioComponent;
    case "file":
      return component as FileComponent;
    case "url":
      return component as UrlComponent;
    case "checkbox":
      return component as CheckboxComponent;
    case "email":
      return component as EmailComponent;
    case "day":
      return component as DayComponent;
    default:
      return component;
  }
}
