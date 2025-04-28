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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MultiSelectForm } from "@/components/ui/multiselect-checkbox";
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DayComponent } from "@deal-fuze/server";

export function RenderFormField({
  form,
  component,
}: {
  form: UseFormReturn<any>;
  component: FormioComponent;
}) {
  switch (component.type) {
    case "textfield":
    case "email":
      return (
        <FormField
          control={form.control}
          name={component.key}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {component.label}
                {component.validate?.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </FormLabel>
              <FormDescription>{component.description}</FormDescription>
              <FormControl>
                <Input
                  id={component.key}
                  type={component.type === "email" ? "email" : "text"}
                  placeholder={
                    (component as TextFieldComponent).placeholder ||
                    `${component.type} field`
                  }
                  required={component.validate?.required}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    case "number":
      const numberComp = component as NumberComponent;
      return (
        <FormField
          control={form.control}
          name={component.key}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {component.label}
                {component.validate?.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </FormLabel>
              <FormDescription>{component.description}</FormDescription>
              <FormControl>
                <Input
                  id={component.key}
                  type="number"
                  placeholder={numberComp.placeholder || "Enter a number"}
                  min={numberComp.validate?.min}
                  max={numberComp.validate?.max}
                  step={numberComp.validate?.step || "any"}
                  required={component.validate?.required}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
      );
    case "textarea":
      return (
        <FormField
          control={form.control}
          name={component.key}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {component.label}
                {component.validate?.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </FormLabel>
              <FormDescription>{component.description}</FormDescription>
              <FormControl>
                <TextArea
                  id={component.key}
                  placeholder={
                    (component as TextFieldComponent).placeholder ||
                    "Enter text here"
                  }
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
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
      return <MultiSelectForm form={form} selectboxesComp={selectboxesComp} />;
    case "select":
      const selectComp = component as SelectComponent;
      return (
        <FormField
          control={form.control}
          name={selectComp.key}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {component.label}
                {component.validate?.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </FormLabel>{" "}
              <FormDescription>{selectComp.description}</FormDescription>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={selectComp.placeholder || "Select an option"}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
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
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
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
        <FormField
          control={form.control}
          name={radioComp.key}
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>
                {radioComp.label}
                {component.validate?.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </FormLabel>
              <FormDescription>{radioComp.description}</FormDescription>
              <FormControl>
                <RadioGroup
                  required={component.validate?.required}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col gap-4 pt-2 pl-2 overflow-y-auto max-h-[390px]"
                >
                  {radioComp.values?.map((option) => (
                    <FormItem
                      key={option.value}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem value={option.value} id={option.value} />
                      <FormLabel htmlFor={option.value}>
                        {option.label}
                      </FormLabel>
                    </FormItem>
                  ))}
                  <FormMessage />
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />
      );
    case "checkbox":
      const checkboxComp = component as CheckboxComponent;

      if (!checkboxComp.name) {
        checkboxComp.name = "Check this box";
      }
      return (
        <FormField
          control={form.control}
          name={checkboxComp.key}
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  {checkboxComp.name}
                  {component.validate?.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </FormLabel>
                <FormDescription>{checkboxComp.description}</FormDescription>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    case "day":
      return (
        <FormField
          control={form.control}
          name={component.key}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {component.label}
                {component.validate?.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </FormLabel>
              <FormDescription>{component.description}</FormDescription>
              <FormControl>
                <Input
                  id={component.key}
                  type="date"
                  placeholder={
                    (component as DayComponent).placeholder || `Select a date`
                  }
                  required={component.validate?.required}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    case "file":
      return (
        <div className="flex items-center gap-2">
          <FormField
            control={form.control}
            name={component.key}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {component.label}
                  {component.validate?.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </FormLabel>
                <FormDescription>{component.description}</FormDescription>
                <FormControl>
                  <Input
                    id={component.key}
                    type="date"
                    placeholder={
                      (component as FileComponent).placeholder ||
                      `Select a file`
                    }
                    required={component.validate?.required}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );
    case "button":
      return <Button>{component.label}</Button>;
    case "url":
      return (
        <FormField
          control={form.control}
          name={component.key}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {component.label}
                {component.validate?.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </FormLabel>
              <FormDescription>{component.description}</FormDescription>
              <FormControl>
                <Input
                  id={component.key}
                  type="url"
                  placeholder={
                    (component as UrlComponent).placeholder || "Enter URL"
                  }
                  required={component.validate?.required}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );

    default:
      return null;
  }
}
