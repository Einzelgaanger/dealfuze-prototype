import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SelectBoxesComponent } from "@formio/core";
import {
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { AccordionContent, AccordionTrigger } from "@radix-ui/react-accordion";
import { AccordionItem } from "@radix-ui/react-accordion";
import { Accordion } from "@radix-ui/react-accordion";
import { ChevronRight } from "lucide-react";

export const MultiSelect = ({
  selectboxesComp,
  collapsed,
}: {
  selectboxesComp: SelectBoxesComponent;
  collapsed?: boolean;
}) => {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleCheckboxChange = (value: string) => {
    setSelectedValues(
      (prev) =>
        prev.includes(value)
          ? prev.filter((v) => v !== value) // Remove if already selected
          : [...prev, value] // Add if not selected
    );
  };

  useEffect(() => {
    console.log(selectedValues);
  }, [selectedValues]);

  if (!collapsed) {
    return (
      <div className="flex flex-col gap-4 pt-2 pl-2 overflow-y-auto max-h-[390px]">
        {selectboxesComp.values?.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <Checkbox
              id={option.value}
              checked={selectedValues.includes(option.value)}
              onCheckedChange={() => handleCheckboxChange(option.value)}
            />
            <Label htmlFor={option.value} className="font-normal">
              {option.label}
            </Label>
          </div>
        ))}
        <input
          type="hidden"
          name={selectboxesComp.key}
          value={selectedValues}
        />
      </div>
    );
  }

  return (
    <div className="">
      <Accordion
        type="single"
        collapsible
        onValueChange={(value) => setIsCollapsed(value === selectboxesComp.key)}
      >
        <AccordionItem value={selectboxesComp.key}>
          <AccordionTrigger className="flex items-center gap-2 text-sm">
            <ChevronRight
              className={`w-4 h-4 ${
                isCollapsed ? "rotate-90 duration-100" : "rotate-0 duration-100"
              }`}
            />
            See options
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 pt-2 pl-2 overflow-y-auto max-h-[390px]">
            {selectboxesComp.values?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={option.value}
                  checked={selectedValues.includes(option.value)}
                  onCheckedChange={() => handleCheckboxChange(option.value)}
                />
                <Label htmlFor={option.value} className="font-normal">
                  {option.label}
                </Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <input type="hidden" name={selectboxesComp.key} value={selectedValues} />
    </div>
  );
};

export const MultiSelectForm = ({
  form,
  selectboxesComp,
}: {
  form: UseFormReturn<any>;
  selectboxesComp: SelectBoxesComponent;
}) => {
  return (
    <FormField
      control={form.control}
      name={selectboxesComp.key}
      render={() => (
        <FormItem>
          <div className="mb-4">
            <FormLabel>
              {selectboxesComp.label}
              {selectboxesComp.validate?.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </FormLabel>
            <FormDescription>{selectboxesComp.description}</FormDescription>
          </div>
          {selectboxesComp.values?.map((item) => (
            <FormField
              key={item.value}
              control={form.control}
              name={selectboxesComp.key}
              render={({ field }) => {
                return (
                  <FormItem
                    key={item.value}
                    className="flex flex-row items-start space-x-3 space-y-0"
                  >
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(item.value)}
                        onCheckedChange={(checked) => {
                          return checked
                            ? field.onChange([...field.value, item.value])
                            : field.onChange(
                                field.value?.filter(
                                  (value: string) => value !== item.value
                                )
                              );
                        }}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      {item.label}
                    </FormLabel>
                  </FormItem>
                );
              }}
            />
          ))}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
