declare module '@formio/core' {
  export class Component {
    // Basic component properties
    key: string;
    label: string;
    type: string;
    input: boolean;
    validate: any;
    defaultValue?: any;
  }

  export class TextFieldComponent extends Component {
    placeholder?: string;
    prefix?: string;
    suffix?: string;
    inputMask?: string;
    allowMultipleMasks?: boolean;
  }

  export class SelectComponent extends Component {
    data: {
      values: Array<{ label: string; value: string }>;
    };
    dataSrc: string;
    valueProperty: string;
    multiple?: boolean;
    placeholder?: string;
  }

  export class ButtonComponent extends Component {
    action: string;
    theme: string;
    size: string;
    block: boolean;
  }

  export class CheckboxComponent extends Component {
    value: boolean;
  }

  export class NumberComponent extends Component {
    min?: number;
    max?: number;
    step?: number;
  }

  export class DayComponent extends Component {
    fields: {
      day: { hide?: boolean };
      month: { hide?: boolean };
      year: { hide?: boolean };
    };
  }

  export class EmailComponent extends Component {
    placeholder?: string;
    prefix?: string;
    suffix?: string;
  }

  export class FileComponent extends Component {
    filePattern?: string;
    fileMaxSize?: number;
  }

  export class PhoneNumberComponent extends Component {
    placeholder?: string;
    inputMask?: string;
  }

  export class RadioComponent extends Component {
    values: Array<{ label: string; value: string }>;
    inline?: boolean;
  }

  export class SelectBoxesComponent extends Component {
    values: Array<{ label: string; value: string }>;
    inline?: boolean;
  }

  export class TextAreaComponent extends Component {
    placeholder?: string;
    rows?: number;
    wysiwyg?: boolean;
  }

  export class UrlComponent extends Component {
    placeholder?: string;
  }
  
  export interface FormSettings {
    components: Component[];
    title?: string;
    display?: string;
    type?: string;
    name?: string;
    path?: string;
  }
} 