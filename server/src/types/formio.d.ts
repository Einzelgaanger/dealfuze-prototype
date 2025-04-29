declare module '@formio/core' {
  export interface FormComponent {
    type: string;
    key: string;
    label: string;
    input: boolean;
    multiple?: boolean;
    data?: {
      values?: Array<{
        label: string;
        value: string;
      }>;
    };
  }

  export interface Form {
    title: string;
    name: string;
    path: string;
    type: string;
    display: string;
    components: FormComponent[];
  }
} 