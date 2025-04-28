import {
  Component as FormioComponent,
  TextFieldComponent as FormioTextFieldComponent,
  SelectComponent as FormioSelectComponent,
  ButtonComponent as FormioButtonComponent,
  CheckboxComponent as FormioCheckboxComponent,
  NumberComponent as FormioNumberComponent,
  DayComponent as FormioDayComponent,
  EmailComponent as FormioEmailComponent,
  FileComponent as FormioFileComponent,
  PhoneNumberComponent as FormioPhoneNumberComponent,
  RadioComponent as FormioRadioComponent,
  SelectBoxesComponent as FormioSelectBoxesComponent,
  TextAreaComponent as FormioTextAreaComponent,
  UrlComponent as FormioUrlComponent,
} from "@formio/core";

export type Component = FormioComponent & {
  isPersonality?: boolean;
};

export type TextFieldComponent = FormioTextFieldComponent & {
  isPersonality?: boolean;
};

export type SelectComponent = FormioSelectComponent & {
  isPersonality?: boolean;
};

export type ButtonComponent = FormioButtonComponent & {
  isPersonality?: boolean;
};

export type CheckboxComponent = FormioCheckboxComponent & {
  isPersonality?: boolean;
};

export type NumberComponent = FormioNumberComponent & {
  isPersonality?: boolean;
};

export type DayComponent = FormioDayComponent & {
  isPersonality?: boolean;
};

export type EmailComponent = FormioEmailComponent & {
  isPersonality?: boolean;
};

export type FileComponent = FormioFileComponent & {
  isPersonality?: boolean;
};

export type PhoneNumberComponent = FormioPhoneNumberComponent & {
  isPersonality?: boolean;
};

export type RadioComponent = FormioRadioComponent & {
  isPersonality?: boolean;
};

export type SelectBoxesComponent = FormioSelectBoxesComponent & {
  isPersonality?: boolean;
};

export type TextAreaComponent = FormioTextAreaComponent & {
  isPersonality?: boolean;
};

export type UrlComponent = FormioUrlComponent & {
  isPersonality?: boolean;
};

export type FormComponent =
  | Component
  | TextFieldComponent
  | SelectComponent
  | ButtonComponent
  | CheckboxComponent
  | NumberComponent
  | DayComponent
  | EmailComponent
  | FileComponent
  | PhoneNumberComponent
  | RadioComponent
  | SelectBoxesComponent
  | TextAreaComponent
  | UrlComponent;
