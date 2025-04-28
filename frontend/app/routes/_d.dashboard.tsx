import { Button } from "@/components/ui/button";
import { api, APIError } from "@/utils/api.server";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { Users, Edit, LinkIcon, Trash, Plus } from "lucide-react";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Pipeline } from "@/types/pipeline.type";

export async function loader(args: LoaderFunctionArgs) {
  const pipelines = await api.get<Pipeline[]>("/pipeline", {
    loaderArgs: args,
  });

  return pipelines;
}

export default function Dashboard() {
  const pipelines = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col gap-6 h-full">
      <Outlet />
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="w-full h-10 bg-gray-50 rounded-lg flex items-center px-4">
        <h2>Pipelines</h2>
      </div>
      <div className="w-full border-gray-200 border rounded-lg">
        {pipelines.length === 0 && (
          <div className="p-4 text-gray-500">No pipelines found</div>
        )}
        <table className="w-full text-sm">
          <tbody>
            {pipelines.map((pipeline: Pipeline) => (
              <tr
                key={pipeline.id}
                className="border-b border-gray-200 last:border-b-0"
              >
                <td className="p-4">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-4">
                    <Link
                      to={`/pipeline/${pipeline.id}`}
                      className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between flex-1 hover:bg-gray-50 rounded-lg p-2 transition-colors w-full"
                    >
                      <div className="w-full md:w-1/2">{pipeline.name}</div>
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-12 w-full">
                        {pipeline.numberOfFounders && (
                          <div className="flex items-center gap-2">
                            <Users size={16} strokeWidth={1.5} />
                            <div className="text-gray-600">
                              {pipeline.numberOfFounders} Founders
                            </div>
                          </div>
                        )}
                        {pipeline.numberOfInvestors && (
                          <div className="flex items-center gap-2">
                            <Users size={16} strokeWidth={1.5} />
                            <div className="text-gray-600">
                              {pipeline.numberOfInvestors} Investors
                            </div>
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="flex items-center gap-4 w-full md:w-auto justify-start md:justify-end">
                      <Link
                        to={`/pipeline/${pipeline.id}/form`}
                        className="flex items-center gap-2 border border-gray-200 rounded-lg p-2 hover:bg-gray-50"
                      >
                        <Edit size={16} strokeWidth={1} />
                        <span>Form</span>
                      </Link>
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(
                            `${window.location.origin}/${pipeline.id}/register`
                          )
                        }
                        className="hover:text-blue-500 hover:bg-gray-50 transition-colors border border-gray-200 rounded-lg p-2"
                      >
                        <LinkIcon size={16} strokeWidth={1} />
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <Link to="/dashboard/create-pipeline">
          <Button className="flex gap-2">
            <Plus size={16} />
            <span className="pr-2">Create</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
