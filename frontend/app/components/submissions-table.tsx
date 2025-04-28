import {
  FormDocument,
  FormType,
  getComponentOptions,
  SubmissionDocument,
  SubmissionStatus,
} from "@deal-fuze/server";
import {
  Ban,
  ChevronDown,
  Clock,
  FileUp,
  Landmark,
  Plus,
  Rocket,
  RotateCcw,
  Trash,
  X,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  useNavigate,
  useFetcher,
  useParams,
  useLocation,
} from "@remix-run/react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import {
  TooltipContent,
  TooltipTrigger,
  Tooltip,
  TooltipProvider,
} from "./ui/tooltip";
import { PopoverClose } from "@radix-ui/react-popover";

export function SubmissionsTable({
  form,
  submissions,
}: {
  form: FormDocument;
  submissions: SubmissionDocument[];
}) {
  const [selectedFounders, setSelectedFounders] = useState<string[]>([]);
  const fetcher = useFetcher();
  const { id } = useParams();
  const { pathname } = useLocation();

  const handleDeleteSelected = () => {
    fetcher.submit(
      {
        submissionIds: selectedFounders,
        redirectUrl: pathname,
      },
      {
        method: "DELETE",
        encType: "application/json",
        action: `/pipeline/${id}/submissions`,
      }
    );
  };

  const columnHelper = createColumnHelper<SubmissionDocument>();
  const navigate = useNavigate();
  const columns = useMemo(() => {
    return form.components.map((component) => {
      return columnHelper.accessor(
        (row: SubmissionDocument) => row.data[component.key],
        {
          id: component.key,
          header: component.label,
          cell: (info) => {
            const value = info.getValue();

            const componentOptions = getComponentOptions(component);

            if (Array.isArray(value)) {
              return value
                .map((v) => {
                  const label =
                    componentOptions.find((option) => option.value === v)
                      ?.label ?? v;
                  return label;
                })
                .join(", ");
            }

            const label =
              componentOptions.find((option) => option.value === value)
                ?.label ?? value;

            return label ?? "-";
          },
        }
      );
    });
  }, [form.components]);

  const table = useReactTable({
    data: submissions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
  });

  const handleRowSelection = (row: SubmissionDocument) => {
    const rowId = row.id;
    setSelectedFounders((prev: string[]) =>
      prev.includes(rowId)
        ? prev.filter((id: string) => id !== rowId)
        : [...prev, rowId]
    );
  };

  const handleRetry = (submissionId: string) => {
    fetcher.submit(
      {
        submissionId,
        redirectUrl: pathname,
      },
      {
        method: "POST",
        encType: "application/json",
        action: `/pipeline/${id}/submissions`,
      }
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold flex gap-2 items-center">
          {form.submitterType === "founder" ? (
            <>
              <Rocket size={16} /> Founders
            </>
          ) : (
            <>
              <Landmark size={16} /> Investors
            </>
          )}
        </h1>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" className="px-2">
                <ChevronDown className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandList>
                  <CommandGroup>
                    <CommandItem
                      className="cursor-pointer"
                      onSelect={handleDeleteSelected}
                    >
                      <PopoverClose className="flex items-center gap-2">
                        <Trash className="w-4 h-4 mr-2" />
                        Delete Selected
                      </PopoverClose>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <Button variant="outline" onClick={() => navigate("add")}>
            <Plus className="w-4 h-4 mr-2" />
            Add {form.submitterType === "founder" ? "Founder" : "Investor"}
          </Button>
          <Button onClick={() => navigate("import")} variant="outline">
            <FileUp className="w-4 h-4 mr-2" />
            Import from Spreadsheet
          </Button>
        </div>
      </div>
      <div className="flex">
        <div className="rounded-md border flex-1 overflow-x-auto">
          <Table className="min-w-[1200px]">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  <TableHead
                    className="w-14"
                    key={`actions-${headerGroup.id}`}
                  ></TableHead>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className={cn(
                      "relative",
                      row.original.status === SubmissionStatus.PENDING &&
                        "bg-[#f5f7fc] text-muted-foreground",
                      row.original.status === SubmissionStatus.FAILED &&
                        "bg-red-50"
                    )}
                  >
                    <TableCell
                      className="w-14 flex items-center justify-center"
                      key={`actions-${row.id}`}
                    >
                      <Checkbox
                        className="px-0 mb-1.5"
                        checked={selectedFounders.includes(row.original.id)}
                        onCheckedChange={() => handleRowSelection(row.original)}
                      />
                    </TableCell>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                    <TableCell>
                      {row.original.status === SubmissionStatus.PENDING && (
                        <TooltipProvider>
                          <Tooltip delayDuration={200}>
                            <TooltipTrigger asChild>
                              <Clock size={16} className="ml-2" />
                            </TooltipTrigger>
                            <TooltipContent>Pending</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {row.original.status === SubmissionStatus.FAILED && (
                        <div className="flex items-center">
                          <TooltipProvider>
                            <Tooltip delayDuration={200}>
                              <TooltipTrigger asChild>
                                <X size={16} className="ml-2 text-red-500" />
                              </TooltipTrigger>
                              <TooltipContent>Failed</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip delayDuration={200}>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRetry(row.original.id)}
                                >
                                  <RotateCcw
                                    size={16}
                                    className="ml-2 text-muted-foreground cursor-pointer"
                                  />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Retry</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 1}
                    className="h-24 text-center"
                  >
                    No submissions yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
