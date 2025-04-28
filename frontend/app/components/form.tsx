"use client";

import { FormDocument, getComponentOptions } from "@deal-fuze/server";
import { useActionData, useSubmit } from "@remix-run/react";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormComponent } from "@deal-fuze/server";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { RenderFormField } from "./form-field";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createFormSchema } from "@deal-fuze/server";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

const LINES_PER_PAGE = 20;

export function FormViewer({ form }: { form: FormDocument }) {
  const actionData = useActionData<{
    errors?: Record<string, string>;
  }>();
  const [currentPage, setCurrentPage] = useState(0);
  const [paginatedComponents, _] = useState<FormComponent[][]>(() => {
    const pages: FormComponent[][] = [];
    let currentPage: FormComponent[] = [];
    let currentLines = 0;

    form.components.forEach((component) => {
      const componentLines = getComponentLines(component);

      if (currentLines + componentLines > LINES_PER_PAGE) {
        pages.push(currentPage);
        currentPage = [component];
        currentLines = componentLines;
      } else {
        currentPage.push(component);
        currentLines += componentLines;
      }
    });

    if (currentPage.length > 0) {
      pages.push(currentPage);
    }

    return pages;
  });

  const totalPages = paginatedComponents.length;

  const submit = useSubmit();

  const formId = String(form._id);

  const formSchema = createFormSchema(form);

  const reactForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      formId: formId,
      ...form.components.reduce((acc, component) => {
        if (component.type === "selectboxes") {
          acc[component.key] = [];
        } else {
          acc[component.key] = "";
        }
        return acc;
      }, {} as Record<string, any>),
    },
  });

  function handleNextPage() {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  }

  function handlePreviousPage() {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  }

  return (
    <Form {...reactForm}>
      <form
        className="space-y-4"
        onSubmit={reactForm.handleSubmit(
          (data) => {
            submit(
              {
                ...data,
                formId: formId,
              },
              {
                method: "post",
                encType: "application/json",
              }
            );
          },
          (errors) => console.error(errors)
        )}
      >
        <FormField
          control={reactForm.control}
          name={"formId"}
          render={({ field }) => (
            <FormItem>
              <Input id={"formId"} type="hidden" {...field} value={formId} />
            </FormItem>
          )}
        />
        {paginatedComponents.map((page, index) => (
          <div
            key={`page-${index}`}
            className={cn("flex flex-col gap-4 w-full", {
              hidden: index !== currentPage,
            })}
          >
            {page?.map((component) => (
              <div key={component.key} className="space-y-2">
                <RenderFormField form={reactForm} component={component} />
                {actionData?.errors?.[component.key] && (
                  <p className="text-red-500 text-sm">
                    {actionData?.errors?.[component.key]?.toString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        ))}
        <div className="flex justify-end pt-4">
          {totalPages > 1 && (
            <Pagination className="w-fit mx-0">
              <PaginationContent>
                {currentPage > 0 && (
                  <PaginationItem className="cursor-pointer">
                    <PaginationPrevious onClick={handlePreviousPage} />
                  </PaginationItem>
                )}
                <PaginationItem className="cursor-pointer">
                  <PaginationNext onClick={handleNextPage} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
          {currentPage === totalPages - 1 && (
            <Button type="submit">Submit</Button>
          )}
        </div>
      </form>
    </Form>
  );
}

function getComponentLines(component: FormComponent) {
  // Max lines a component has before it needs to be scrolled
  const MAX_LINES = 13;
  let lines = 1;

  if (component.type === "selectboxes" || component.type === "checkboxes") {
    lines +=
      getComponentOptions(component).length > MAX_LINES
        ? MAX_LINES
        : getComponentOptions(component).length;
  } else if (component.type === "textarea") {
    lines += 3;
  } else {
    lines += 1;
  }

  return lines;
}
