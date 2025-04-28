import Papa from "papaparse";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useFetcher, useParams } from "@remix-run/react";
import { FormDocument, MatchCriteriaDocument } from "@deal-fuze/server";

export function ImportDialog({
  isOpen,
  onClose,
  formComponents,
  matchCriteria,
  formId,
}: {
  isOpen: boolean;
  onClose: () => void;
  formComponents: FormDocument["components"];
  matchCriteria: MatchCriteriaDocument;
  formId: string;
}) {
  const fetcher = useFetcher();
  const [data, setData] = useState<{
    file: File | null;
    columns: string[];
    data: Record<string, any>;
  } | null>(null);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [compatibleColumns, setCompatibleColumns] = useState<
    Record<string, string[]>
  >({});
  const [createOptions, setCreateOptions] = useState(false);
  const [page, setPage] = useState(0);
  const { id } = useParams();
  const [error, setError] = useState<string | null>(null);
  const transformRow = (row: any) => {
    const mappedRow: Record<string, any> = {};
    Object.entries(mappings).forEach(([componentKey, headerKey]) => {
      if (headerKey === "none") return;

      if (createOptions) {
        mappedRow[componentKey] = row[headerKey];
        return mappedRow;
      }

      const component = formComponents.find((c) => c.key === componentKey);
      if (!component) return;

      let value = row[headerKey];

      // Handle different component types
      if (
        component.type === "select" ||
        component.type === "radio" ||
        component.type === "selectboxes"
      ) {
        const options =
          "values" in component
            ? component.values
            : (component as any).data?.values;
        if (!options) return;

        // Validate if the value exists in options
        const validOption = options.find(
          (opt: any) =>
            opt.value.toLowerCase() === value?.toLowerCase() ||
            opt.label.toLowerCase() === value?.toLowerCase()
        );

        if (validOption) {
          value = validOption.value;
        } else {
          value = null; // Invalid option
        }
      }

      if (value !== null && value !== undefined) {
        mappedRow[componentKey] = value;
      }
    });
    return mappedRow;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== "text/csv") {
      setError("Invalid file type");
      return;
    }

    Papa.parse<Record<string, any>>(selectedFile, {
      header: true,
      preview: 5,
      complete: (results) => {
        if (results.data.length > 0) {
          const sheetData: Record<string, any> = {};
          Object.entries(results.data).forEach(([key, value]) => {
            sheetData[key] = value;
          });

          setData({
            file: selectedFile,
            columns: Object.keys(results.data[0]),
            data: sheetData,
          });
        }
      },
    });
  };

  useEffect(() => {
    setCompatibleColumns({});
    if (data?.columns) {
      for (const column of data.columns) {
        for (const component of formComponents) {
          if (isColumnCompatible(component.key, column)) {
            setCompatibleColumns((prev) => ({
              ...prev,
              [component.key]: [...(prev[component.key] || []), column],
            }));
          }
        }
      }
    }
  }, [data, formComponents, createOptions]);

  const handleColumnMapping = (componentKey: string, headerKey: string) => {
    if (headerKey === "none") {
      setMappings((prev) => {
        const newMappings = { ...prev };
        delete newMappings[componentKey];
        return newMappings;
      });
      return;
    }

    setMappings((prev) => ({
      ...prev,
      [componentKey]: headerKey,
    }));
  };

  function isColumnCompatible(
    componentKey: string,
    headerKey: string
  ): boolean {
    const component = formComponents.find((c) => c.key === componentKey);
    if (!component) return false;

    const columnData = Object.values(data?.data || {}).map(
      (row: any) => row[headerKey]
    );

    if (!columnData) return false;

    // Check if any value in the column is non-empty and matches the expected type
    const hasValidData = columnData.some((value: any) => {
      if (value === null || value === undefined || value === "") return false;

      switch (component.type) {
        case "number":
          return !isNaN(Number(value));

        case "selectboxes": {
          if (value.includes(" ,")) {
            value = value.split(" ,");
          } else if (value.includes(",")) {
            value = value.split(",");
          } else {
            value = [value];
          }

          const options =
            "values" in component
              ? component.values
              : (component as any).data?.values;
          if (!options) return false;

          return value.every((v: string) =>
            options.some(
              (opt: any) =>
                opt.value.toLowerCase() === String(v).toLowerCase() ||
                opt.label.toLowerCase() === String(v).toLowerCase()
            )
          );
        }
        case "select":
        case "radio": {
          const options =
            "values" in component
              ? component.values
              : (component as any).data?.values;
          if (!options) return false;
          return options.some(
            (opt: any) =>
              opt.value.toLowerCase() === String(value).toLowerCase() ||
              opt.label.toLowerCase() === String(value).toLowerCase()
          );
        }

        case "checkbox":
          return (
            typeof value === "boolean" ||
            ["true", "false", "0", "1", "yes", "no"].includes(
              String(value).toLowerCase()
            )
          );

        case "datetime":
          return !isNaN(Date.parse(value));

        case "email":
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value));

        case "url":
          try {
            new URL(String(value));
            return true;
          } catch {
            return false;
          }

        case "phone":
          return /^[\d\s()+\-\.]+$/.test(String(value));

        default:
          return true;
      }
    });

    return hasValidData;
  }

  const onDone = ({
    optionsToAdd,
  }: {
    optionsToAdd?: Record<string, { label: string; value: string }[]>;
  }) => {
    const parsedSubmissions = Object.keys(data?.data || {}).map((key) =>
      transformRow(data?.data[key])
    );

    fetcher.submit(
      JSON.stringify({
        optionsToAdd: optionsToAdd ?? undefined,
        submissions: parsedSubmissions,
        formId,
      }),
      {
        method: "POST",
        action: `/pipeline/${id}/investors/import`,
        encType: "application/json",
      }
    );
  };

  const handleCreateOptions = () => {
    setPage(1);
  };

  if (page === 1 && createOptions) {
    return (
      <CreateOptionsDialog
        isOpen={createOptions}
        onClose={() => setCreateOptions(false)}
        mappings={mappings}
        formComponents={formComponents}
        data={data?.data || {}}
        onCreateOptions={onDone}
        matchCriteria={matchCriteria}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Import Submissions from Spreadsheet</DialogTitle>
        </DialogHeader>
        <div className="space-y-8">
          <div>
            <Input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleChange}
            />
            <p className="text-sm text-muted-foreground mt-2">
              Upload a CSV or Excel file with your submission data
            </p>
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </div>
          {Object.keys(data?.data || {}).length > 0 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Map Columns to Form Fields</h3>
                <p className="text-sm text-muted-foreground py-1">
                  Ensure that all values in the columns are valid for the form
                  fields.
                </p>
                <div className="flex items-center gap-2 my-2">
                  <Checkbox
                    id="skip-validation"
                    checked={createOptions}
                    onCheckedChange={() => {
                      setCreateOptions(!createOptions);
                    }}
                  />
                  <Label htmlFor="skip-validation">
                    Update field options to match imported data
                  </Label>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="space-y-2">
                {formComponents.map((component) => {
                  // Get compatible headers for this component
                  const compatibleHeaders =
                    (!createOptions
                      ? compatibleColumns[component.key]
                      : data?.columns) ?? [];

                  return (
                    <div
                      key={component.key}
                      className="flex items-center gap-8"
                    >
                      <div className="w-1/3">
                        <p className="text-sm font-medium">{component.label}</p>
                      </div>
                      <div className="flex-1">
                        <Select
                          value={mappings[component.key]}
                          onValueChange={(value) =>
                            handleColumnMapping(component.key, value)
                          }
                          disabled={
                            !createOptions &&
                            compatibleHeaders.length === 0 &&
                            !component.validate?.required
                          }
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                !createOptions && compatibleHeaders.length === 0
                                  ? "No compatible columns"
                                  : "Select a column"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {!component.validate?.required && (
                              <SelectItem value="none">None</SelectItem>
                            )}
                            {!createOptions &&
                              compatibleHeaders.map((header) => (
                                <SelectItem key={header} value={header}>
                                  {header}
                                </SelectItem>
                              ))}
                            {createOptions &&
                              compatibleHeaders.map((header) => (
                                <SelectItem key={header} value={header}>
                                  {header}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {Object.keys(data?.data || {}).length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Preview</h3>
              <div className="border rounded-lg overflow-auto overflow-y-auto max-h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Field</TableHead>
                      {Object.keys(data?.data || {}).map((_, i) => (
                        <TableHead key={i}>Response</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formComponents.map((component) => (
                      <TableRow key={component.key}>
                        <TableCell className="font-medium">
                          {component.label}
                        </TableCell>
                        {(() => {
                          const mappedRow = transformRow(data?.data[0]);
                          return (
                            <TableCell>
                              {mappedRow[component.key] || "-"}
                            </TableCell>
                          );
                        })()}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={createOptions ? handleCreateOptions : () => onDone({})}
            disabled={!data?.file || Object.keys(mappings).length === 0}
          >
            {createOptions ? "Next" : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateOptionsDialog({
  isOpen,
  onClose,
  mappings,
  formComponents,
  data,
  onCreateOptions,
  matchCriteria,
}: {
  isOpen: boolean;
  onClose: () => void;
  mappings: Record<string, string>;
  formComponents: FormDocument["components"];
  data: Record<string, any>;
  onCreateOptions: ({
    optionsToAdd,
  }: {
    optionsToAdd?: Record<string, { label: string; value: string }[]>;
  }) => void;
  matchCriteria: MatchCriteriaDocument;
}) {
  const [createdOptions, setCreatedOptions] = useState<
    Record<string, { label: string; value: string }[]>
  >(() => {
    const options: Record<string, { label: string; value: string }[]> = {};
    for (const component of formComponents) {
      const headerKey = mappings[component.key];
      if (!headerKey || headerKey === "none") continue;

      // Only show components that can have options
      if (!["select", "radio", "selectboxes"].includes(component.type))
        continue;

      const newOptions = getNewOptions(component, headerKey);
      if (newOptions.length === 0) continue;

      options[component.key] = newOptions.map((option) => ({
        label: option,
        value: option,
      }));
    }

    return options;
  });

  useEffect(() => {
    if (Object.entries(createdOptions).length === 0) {
      onCreateOptions({});
    }
  }, [createdOptions]);

  // Function to gt unique values from a column
  function getUniqueValues(columnName: string): string[] {
    console.log(data);
    const values = Object.values(data || {})
      .map((row: any) => row[columnName])
      .filter((value) => value !== null && value !== undefined && value !== "")
      .map((value) => String(value).trim());

    console.log(values);
    return [...new Set(values)];
  }

  // Function to get new options for a component
  function getNewOptions(component: any, headerKey: string): string[] {
    const columnValues = getUniqueValues(headerKey);
    const existingOptions =
      ("values" in component
        ? component.values
        : (component as any).data?.values) || [];
    const existingValues = new Set(
      existingOptions.map((opt: any) => opt.label.toLowerCase())
    );

    return columnValues.filter(
      (value) => !existingValues.has(value.toLowerCase())
    );
  }

  function onDone() {
    const optionsToAdd: Record<string, { label: string; value: string }[]> = {};
    for (const [key, options] of Object.entries(createdOptions)) {
      optionsToAdd[key] = options;
    }
    onCreateOptions({ optionsToAdd });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Confirm Field Modifications</DialogTitle>
          <DialogDescription>
            The following fields will be updated with new options. Please review
            the changes before proceeding.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4 max-h-[80vh] overflow-y-auto">
          {formComponents.map((component) => {
            const headerKey = mappings[component.key];
            if (!headerKey || headerKey === "none") return null;

            // Only show components that can have options
            if (!["select", "radio", "selectboxes"].includes(component.type))
              return null;

            const newOptions = getNewOptions(component, headerKey);
            if (newOptions.length === 0) return null;

            return (
              <div key={component.key} className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">{component.label}</h3>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {matchCriteria.matchCriteria.find(
                      (c) => c.investorField === component.key
                    )
                      ? "Options will be added to both forms. "
                      : ""}
                    New options to be added:
                  </p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Label</TableHead>
                        <TableHead>Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {newOptions.map((option, index) => (
                        <TableRow key={index}>
                          <TableCell className="bg-muted px-2 py-1 rounded text-sm">
                            <Input
                              className=""
                              type="text"
                              value={createdOptions[component.key][index].label}
                              onChange={(e) => {
                                const newOptions = [
                                  ...createdOptions[component.key],
                                ];
                                newOptions[index].label = e.target.value;
                                setCreatedOptions({
                                  ...createdOptions,
                                  [component.key]: newOptions,
                                });
                              }}
                            />
                          </TableCell>
                          <TableCell className="bg-muted px-2 py-1 rounded text-sm w-1/2">
                            {option}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            );
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onDone();
            }}
          >
            Confirm & Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
