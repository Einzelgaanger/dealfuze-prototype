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

    // Fetch matches for this pipeline
    const matches = await api.get<{
      pipelineId: string;
      founderMatches: any[];
      investorMatches: any[];
    }>(`/pipeline/${id}/matches`, {
      loaderArgs: args,
    });

    return {
      pipeline,
      investorSubmissions: investorSubmissions.data,
      founderSubmissions: founderSubmissions.data,
      matches,
    };
  } catch (error) {
    return redirectWithToast("/dashboard", {
      type: "error",
      title: "Pipeline not found",
    });
  }
}

export default function PipelinePage() {
  const { pipeline, investorSubmissions, founderSubmissions, matches } = useLoaderData<{
    pipeline: Pipeline;
    investorSubmissions: SubmissionDocument[];
    founderSubmissions: SubmissionDocument[];
    matches: {
      pipelineId: string;
      founderMatches: any[];
      investorMatches: any[];
    };
  }>();

  const navigate = useNavigate();

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

        <p className="text-muted-foreground">{pipeline.description}</p>

        <div className="flex flex-wrap gap-4">
          <Card className="flex-1 min-w-[300px]">
            <CardContent className="flex flex-col gap-4 pt-6">
              <div className="flex items-center gap-2">
                <Landmark className="text-muted-foreground" size={20} />
                <h2 className="text-lg font-semibold">Pipeline Overview</h2>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Founders</span>
                  <span className="font-medium">{pipeline.numberOfFounders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Investors</span>
                  <span className="font-medium">{pipeline.numberOfInvestors}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1 min-w-[300px]">
            <CardContent className="flex flex-col gap-4 pt-6">
              <div className="flex items-center gap-2">
                <Zap className="text-muted-foreground" size={20} />
                <h2 className="text-lg font-semibold">Quick Actions</h2>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  to={`/pipeline/${pipeline.id}/match-criteria`}
                  className="flex justify-between items-center hover:bg-muted p-2 rounded-md transition-colors"
                >
                  <span className="text-muted-foreground">Match Criteria</span>
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to={`/pipeline/${pipeline.id}/form`}
                  className="flex justify-between items-center hover:bg-muted p-2 rounded-md transition-colors"
                >
                  <span className="text-muted-foreground">Forms</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Matching Dashboard */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Rocket className="text-muted-foreground" size={20} />
            <h2 className="text-lg font-semibold">Matching Dashboard</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Founder Matches */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                  <h3 className="text-md font-semibold">Top Matches for Founders</h3>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Founder</TableHead>
                          <TableHead>Best Investor Match</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {matches.founderMatches
                          .filter((match, index, self) => 
                            // Get only the top match for each founder
                            index === self.findIndex(m => m.founderId === match.founderId)
                          )
                          .map((match) => (
                            <TableRow key={match.id}>
                              <TableCell className="font-medium">{match.founderName}</TableCell>
                              <TableCell>{match.investorName}</TableCell>
                              <TableCell>{Math.round(match.score * 100)}%</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs ${match.status === 'accepted' ? 'bg-green-100 text-green-800' : match.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                                  {match.status}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        {matches.founderMatches.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                              No matches found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate(`/pipeline/${pipeline.id}/founders`)} >
                      View All Founders <ArrowRightIcon className="ml-1" size={12} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Investor Matches */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                  <h3 className="text-md font-semibold">Top Matches for Investors</h3>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Investor</TableHead>
                          <TableHead>Best Founder Match</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {matches.investorMatches
                          .filter((match, index, self) => 
                            // Get only the top match for each investor
                            index === self.findIndex(m => m.investorId === match.investorId)
                          )
                          .map((match) => (
                            <TableRow key={match.id}>
                              <TableCell className="font-medium">{match.investorName}</TableCell>
                              <TableCell>{match.founderName}</TableCell>
                              <TableCell>{Math.round(match.score * 100)}%</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs ${match.status === 'accepted' ? 'bg-green-100 text-green-800' : match.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                                  {match.status}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        {matches.investorMatches.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                              No matches found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate(`/pipeline/${pipeline.id}/investors`)} >
                      View All Investors <ArrowRightIcon className="ml-1" size={12} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <ChartLine className="text-muted-foreground" size={20} />
            <h2 className="text-lg font-semibold">Statistics</h2>
          </div>

          <PipelineStatistics
            investorSubmissions={investorSubmissions}
            founderSubmissions={founderSubmissions}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <File className="text-muted-foreground" size={20} />
            <h2 className="text-lg font-semibold">Recent Submissions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Founders</h3>
              <PipelinePeopleSummaryView
                people={founderSubmissions.map((submission) => ({
                  name: (submission.data.name as string) || 'Unknown',
                  submittedAt: new Date(submission.submittedAt),
                }))}
              />
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Investors</h3>
              <PipelinePeopleSummaryView
                people={investorSubmissions.map((submission) => ({
                  name: (submission.data.name as string) || 'Unknown',
                  submittedAt: new Date(submission.submittedAt),
                }))}
              />
            </div>
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
