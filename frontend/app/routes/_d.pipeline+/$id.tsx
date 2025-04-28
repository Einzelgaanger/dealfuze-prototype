import { api } from "@/utils/api.server";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Pipeline } from "@/types/pipeline.type";
import {
  Link,
  Outlet,
  useLoaderData,
  useNavigate,
  ShouldRevalidateFunctionArgs,
} from "@remix-run/react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowRightIcon,
  ChartLine,
  Edit,
  File,
  Landmark,
  Rocket,
  Trash,
  Zap,
} from "lucide-react";
import { redirectWithToast } from "@/components/toast/toast.server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FormDocument, FormType, SubmissionDocument } from "@deal-fuze/server";
import { Cell, Label, Pie, PieChart, Tooltip } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { ChartTooltipContent } from "@/components/ui/chart";
import { ChartContainer } from "@/components/ui/chart";
import { titleCase } from "@/utils/text";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);
dayjs.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "a few seconds",
    m: "a minute",
    mm: "%d minutes",
    h: "an hour",
    hh: "%d hours",
    d: "a day",
    dd: "%d days",
    M: "a month",
    MM: "%d months",
    y: "a year",
    yy: "%d years",
  },
});

export function shouldRevalidate({
  currentParams,
  nextParams,
  formMethod,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  if (formMethod === "GET" && currentParams.id === nextParams.id) {
    return false;
  }

  return defaultShouldRevalidate;
}

export async function loader(args: LoaderFunctionArgs) {
  const { id } = args.params;

  try {
    const pipeline = await api.get<Pipeline>(`/pipeline/${id}`, {
      loaderArgs: args,
    });

    const forms = await api.get<{ data: FormDocument[] }>(
      `/pipeline/${id}/form`,
      {
        loaderArgs: args,
      }
    );

    const investorForm = forms.data.find(
      (form) => form.submitterType === FormType.INVESTOR
    );

    const founderForm = forms.data.find(
      (form) => form.submitterType === FormType.FOUNDER
    );

    if (!investorForm || !founderForm) {
      return redirectWithToast(`/pipeline/${id}`, {
        type: "error",
        title: "No investor or founder form found",
      });
    }

    const investorSubmissions = await api.get<{ data: SubmissionDocument[] }>(
      `/forms/${investorForm._id}/submissions`,
      {
        loaderArgs: args,
      }
    );

    const founderSubmissions = await api.get<{ data: SubmissionDocument[] }>(
      `/forms/${founderForm._id}/submissions`,
      {
        loaderArgs: args,
      }
    );

    return {
      pipeline,
      investorSubmissions: investorSubmissions.data,
      founderSubmissions: founderSubmissions.data,
    };
  } catch (error) {
    return redirectWithToast("/dashboard", {
      type: "error",
      title: "Pipeline not found",
    });
  }
}

export default function PipelinePage() {
  const { pipeline, investorSubmissions, founderSubmissions } = useLoaderData<{
    pipeline: Pipeline;
    investorSubmissions: SubmissionDocument[];
    founderSubmissions: SubmissionDocument[];
  }>();

  const navigate = useNavigate();

  console.log(investorSubmissions);

  return (
    <div>
      <Outlet />
      <div className="flex flex-col gap-6">
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold">{pipeline.name}</h1>
          <div className="flex gap-2">
            <Link to={`/pipeline/${pipeline.id}/edit`}>
              <Button variant="outline" className="p-2 h-full">
                <Edit size={16} />
              </Button>
            </Link>
            <Link to={`/pipeline/${pipeline.id}/delete`}>
              <Button variant="outline" className="p-2 h-full">
                <Trash size={16} />
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/pipeline/${pipeline.id}/match-criteria`}>
            <Button className="p-2 px-4 flex gap-2" size="sm">
              <Zap size={14} />
              Match Criteria
            </Button>
          </Link>
          <Link to={`/pipeline/${pipeline.id}/form`}>
            <Button className="p-2 px-4 flex gap-2" size="sm">
              <File size={14} />
              Form
            </Button>
          </Link>
        </div>
        {pipeline.description && (
          <p className="text-gray-500 w-full lg:w-2/3 text-sm">
            {pipeline.description}
          </p>
        )}
        <div className="flex gap-4 items-end">
          <PipelineStatistics
            investorSubmissions={investorSubmissions}
            founderSubmissions={founderSubmissions}
          />
          <div className="flex flex-col gap-4 flex-1">
            <Link
              to={`/pipeline/${pipeline.id}/founders`}
              className="flex justify-between w-full bg-gray-50 items-center p-2 mb-2 rounded-lg group cursor-pointer transition-all duration-50"
            >
              <div className="flex gap-2 items-center">
                <ChartLine />
                <h3 className="text-lg font-semibold">Top Matches</h3>
              </div>
              <div className="group-hover:visible invisible">
                <ArrowRightIcon size={16} />
              </div>
            </Link>
            <div className="border border-gray-200 rounded-lg">
              <Table className="w-full text-left">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">No.</TableHead>
                    <TableHead className="text-center">Investor</TableHead>
                    <TableHead className="text-center">Founder</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      investor: "John Doe",
                      founder: "Jane Doe",
                      score: 0.9,
                      personality: 0.9,
                    },
                    {
                      investor: "John Doe",
                      founder: "Jane Doe",
                      score: 0.9,
                      personality: 0.9,
                    },
                    {
                      investor: "John Doe",
                      founder: "Jane Doe",
                      score: 0.9,
                      personality: 0.9,
                    },
                    {
                      investor: "John Doe",
                      founder: "Jane Doe",
                      score: 0.9,
                      personality: 0.9,
                    },
                    {
                      investor: "John Doe",
                      founder: "Jane Doe",
                      score: 0.9,
                      personality: 0.9,
                    },
                    {
                      investor: "John Doe",
                      founder: "Jane Doe",
                      score: 0.9,
                      personality: 0.9,
                    },
                  ]
                    .slice(0, 6)
                    .map((match, i) => (
                      <TableRow
                        key={`${match.investor}-${i}`}
                        className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-all duration-50 w-full"
                        onClick={() => {
                          navigate(
                            `/pipeline/${pipeline.id}/match?founder=${match.founder}&investor=${match.investor}`
                          );
                        }}
                      >
                        <TableCell className="p-2 text-sm text-gray-700 text-center">
                          {i + 1}
                        </TableCell>
                        <TableCell className="p-2 text-sm text-gray-700 text-center">
                          {match.investor}
                        </TableCell>
                        <TableCell className="p-2 text-sm text-gray-700 text-center">
                          {match.founder}
                        </TableCell>
                        <TableCell className="p-2 text-sm text-gray-700 text-center">
                          {match.score * 100}%
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
        <div className="flex md:flex-row flex-col gap-6 w-full">
          <div className="w-full">
            <Link
              to={`/pipeline/${pipeline.id}/investors`}
              className="flex justify-between w-full hover:bg-gray-50 items-center p-2 mb-2 rounded-lg group cursor-pointer transition-all duration-50"
            >
              <div className="flex gap-2 items-center">
                <Landmark size={16} />
                <h3 className="text-lg font-semibold">Recent Investors</h3>
              </div>
              <div className="group-hover:visible invisible">
                <ArrowRightIcon size={16} />
              </div>
            </Link>
            <PipelinePeopleSummaryView
              people={investorSubmissions.slice(0, 6).map((submission) => {
                return {
                  name: submission.name,
                  submittedAt: submission.submittedAt,
                };
              })}
            />
          </div>
          <div className="w-full">
            <Link
              to={`/pipeline/${pipeline.id}/founders`}
              className="flex justify-between w-full hover:bg-gray-50 items-center p-2 mb-2 rounded-lg group cursor-pointer transition-all duration-50"
            >
              <div className="flex gap-2 items-center">
                <Rocket size={16} />
                <h3 className="text-lg font-semibold">Recent Founders</h3>
              </div>
              <div className="group-hover:visible invisible">
                <ArrowRightIcon size={16} />
              </div>
            </Link>
            <PipelinePeopleSummaryView
              people={founderSubmissions.slice(0, 6).map((submission) => {
                return {
                  name: submission.name,
                  submittedAt: submission.submittedAt,
                };
              })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function PipelinePeopleSummaryView({
  people,
}: {
  people: { name: string; submittedAt: Date }[];
}) {
  return (
    <div className="flex flex-col border border-b-0 border-gray-200 rounded-lg overflow-y-auto max-h-[400px]">
      {people.map((person, idx) => (
        <div key={person.name} className="flex border-b border-gray-200">
          <div className="text-sm text-gray-700 p-2 px-4 w-full">
            {person.name}
          </div>
          <div className="text-[10px] text-gray-700 flex items-center justify-center py-2 w-28">
            <div>{dayjs(person.submittedAt).fromNow()}</div>
          </div>
        </div>
      ))}
      {people.length === 0 && (
        <div className="flex-1 flex items-center justify-center min-h-[100px] text-muted-foreground text-xs border-b border-gray-200">
          <p>No data to show</p>
        </div>
      )}
    </div>
  );
}

function PipelineStatistics({
  investorSubmissions,
  founderSubmissions,
}: {
  investorSubmissions: SubmissionDocument[];
  founderSubmissions: SubmissionDocument[];
}) {
  const isData =
    investorSubmissions.length > 0 || founderSubmissions.length > 0;

  const data = isData
    ? [
        {
          name: titleCase(FormType.INVESTOR + "s"),
          value: investorSubmissions.length,
          type: FormType.INVESTOR,
          color: "#676a73",
        },
        {
          name: titleCase(FormType.FOUNDER + "s"),
          value: founderSubmissions.length,
          type: FormType.FOUNDER,
          color: "#333640",
        },
      ]
    : [
        {
          name: "No data",
          value: 1,
          type: "No data",
          color: "#676a73",
        },
      ];

  return (
    <div className="pt-4">
      <Card className="flex flex-col w-fit shadow-none min-w-[290px] p-8">
        <CardContent className="flex-1 p-0">
          {!founderSubmissions.length && !investorSubmissions.length && (
            <div className="flex-1 flex items-center justify-center h-full text-muted-foreground">
              <p>No data to show</p>
            </div>
          )}
          <ChartContainer
            config={{
              value: {
                label: "Count",
              },
              ...Object.fromEntries(
                data.map((sub, i) => [
                  sub.type,
                  {
                    label: titleCase(sub.type),
                    color: sub.color,
                  },
                ])
              ),
            }}
            className="aspect-square max-h-[280px] flex items-center justify-center"
          >
            <PieChart>
              {isData && (
                <Tooltip content={<ChartTooltipContent hideLabel />} />
              )}
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                stroke={data[0].color}
                labelLine={false}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) - 10}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {isData
                              ? data.reduce((acc, curr) => acc + curr.value, 0)
                              : 0}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 14}
                            className="fill-muted-foreground"
                          >
                            Submissions
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
