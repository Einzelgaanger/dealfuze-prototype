// Preview components for the builder interface
import {
  Component as FormioComponent,
  TextFieldComponent,
  NumberComponent,
  SelectComponent,
  SelectBoxesComponent,
  RadioComponent,
  FileComponent,
  UrlComponent,
  CheckboxComponent,
} from "@formio/core";
import { Input, TextArea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectGroup,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MultiSelect } from "@/components/ui/multiselect-checkbox";

export function PreviewFormField({
  component,
  collapsed = false,
}: {
  component: FormioComponent;
  collapsed?: boolean;
}) {
  switch (component.type) {
    case "textfield":
    case "email":
      return (
        <Input
          id={component.key}
          type={component.type}
          placeholder={
            (component as TextFieldComponent).placeholder ||
            `${component.type} field`
          }
        />
      );
    case "number":
      const numberComp = component as NumberComponent;
      return (
        <Input
          id={component.key}
          type="number"
          placeholder={numberComp.placeholder || "Enter a number"}
          min={numberComp.validate?.min}
          max={numberComp.validate?.max}
          step={numberComp.validate?.step || "any"}
        />
      );
    case "textarea":
      return (
        <TextArea
          id={component.key}
          placeholder={
            (component as TextFieldComponent).placeholder || "Enter text here"
          }
        />
      );
    case "selectboxes":
      const selectboxesComp = component as SelectBoxesComponent;
      if (!selectboxesComp.values?.length) {
        selectboxesComp.values = [
          { label: "Option 1", value: "option1" },
          { label: "Option 2", value: "option2" },
        ];
      }
      return (
        <MultiSelect selectboxesComp={selectboxesComp} collapsed={collapsed} />
      );
    case "select":
      const selectComp = component as SelectComponent;
      return (
        <Select>
          <SelectTrigger>
            <SelectValue
              placeholder={selectComp.placeholder || "Select an option"}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {(
                (
                  selectComp.data as {
                    values: {
                      label: string;
                      value: string;
                    }[];
                  }
                ).values || []
              ).map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      );
    case "radio":
      const radioComp = component as RadioComponent;
      if (!radioComp.values?.length) {
        radioComp.values = [
          { label: "Option 1", value: "option1" },
          { label: "Option 2", value: "option2" },
        ];
      }
      return (
        <RadioGroup className="flex flex-col gap-4 pt-2 pl-2">
          {radioComp.values?.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={option.value} />
              <Label htmlFor={option.value}>{option.label}</Label>
            </div>
          ))}
        </RadioGroup>
      );
    case "checkbox":
      const checkboxComp = component as CheckboxComponent;

      if (!checkboxComp.name) {
        checkboxComp.name = "Check this box";
      }
      return (
        <div className="flex items-center space-x-2">
          <Checkbox id={checkboxComp.key} />
          <Label htmlFor={checkboxComp.key}>{checkboxComp.name}</Label>
        </div>
      );
    case "day":
      return <Input type="date" placeholder="Select date" />;
    case "file":
      return (
        <div className="flex items-center gap-2">
          <Input
            type="file"
            className="flex-1"
            accept={(component as FileComponent).filePattern || undefined}
          />
        </div>
      );
    case "button":
      return <Button>{component.label}</Button>;
    case "url":
      if (component.key === "linkedinurl") {
        return (
          <div className="flex flex-col gap-2">
            <Input
              type="url"
              placeholder={
                (component as UrlComponent).placeholder || "Enter a URL"
              }
            />
            <p className="text-xs text-gray-500">
              This is a special field that will be used to get a submitter's
              personality profile. If this is not intended, use the normal URL
              field.
            </p>
          </div>
        );
      }
      return (
        <Input
          type="url"
          placeholder={(component as UrlComponent).placeholder || "Enter a URL"}
        />
      );

    default:
      return null;
  }
}
