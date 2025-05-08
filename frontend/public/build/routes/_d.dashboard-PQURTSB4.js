import {
  require_api
} from "/build/_shared/chunk-MKAXAYAI.js";
import {
  Button
} from "/build/_shared/chunk-7LFJABGF.js";
import {
  Link as Link2,
  Plus,
  SquarePen,
  Users
} from "/build/_shared/chunk-DVRXU2YJ.js";
import "/build/_shared/chunk-KUGFZWZA.js";
import {
  Link,
  Outlet,
  init_esm,
  useLoaderData
} from "/build/_shared/chunk-3PYAUO7Q.js";
import {
  createHotContext,
  init_remix_hmr
} from "/build/_shared/chunk-JDDA2FTR.js";
import "/build/_shared/chunk-M3R3PWNJ.js";
import "/build/_shared/chunk-6SFGVGP7.js";
import {
  require_jsx_dev_runtime
} from "/build/_shared/chunk-CXRXIBWZ.js";
import "/build/_shared/chunk-FNINLW4T.js";
import {
  __toESM
} from "/build/_shared/chunk-PZDJHGND.js";

// app/routes/_d.dashboard.tsx
init_remix_hmr();
var import_api = __toESM(require_api(), 1);
init_esm();
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\routes\\\\_d.dashboard.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\routes\\_d.dashboard.tsx"
  );
  import.meta.hot.lastModified = "1746337063453.9258";
}
function Dashboard() {
  _s();
  const pipelines = useLoaderData();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex flex-col gap-6 h-full", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Outlet, {}, void 0, false, {
      fileName: "app/routes/_d.dashboard.tsx",
      lineNumber: 36,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h1", { className: "text-2xl font-bold", children: "Dashboard" }, void 0, false, {
      fileName: "app/routes/_d.dashboard.tsx",
      lineNumber: 37,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "w-full h-10 bg-gray-50 rounded-lg flex items-center px-4", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("h2", { children: "Pipelines" }, void 0, false, {
      fileName: "app/routes/_d.dashboard.tsx",
      lineNumber: 39,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "app/routes/_d.dashboard.tsx",
      lineNumber: 38,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "w-full border-gray-200 border rounded-lg", children: [
      pipelines.length === 0 && /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "p-4 text-gray-500", children: "No pipelines found" }, void 0, false, {
        fileName: "app/routes/_d.dashboard.tsx",
        lineNumber: 42,
        columnNumber: 36
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("table", { className: "w-full text-sm", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("tbody", { children: pipelines.map((pipeline) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("tr", { className: "border-b border-gray-200 last:border-b-0", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("td", { className: "p-4", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-4", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, { to: `/pipeline/${pipeline.id}`, className: "flex flex-col md:flex-row items-start md:items-center gap-4 justify-between flex-1 hover:bg-gray-50 rounded-lg p-2 transition-colors w-full", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "w-full md:w-1/2", children: pipeline.name }, void 0, false, {
            fileName: "app/routes/_d.dashboard.tsx",
            lineNumber: 49,
            columnNumber: 23
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-12 w-full", children: [
            pipeline.numberOfFounders && /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Users, { size: 16, strokeWidth: 1.5 }, void 0, false, {
                fileName: "app/routes/_d.dashboard.tsx",
                lineNumber: 52,
                columnNumber: 29
              }, this),
              /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "text-gray-600", children: [
                pipeline.numberOfFounders,
                " Founders"
              ] }, void 0, true, {
                fileName: "app/routes/_d.dashboard.tsx",
                lineNumber: 53,
                columnNumber: 29
              }, this)
            ] }, void 0, true, {
              fileName: "app/routes/_d.dashboard.tsx",
              lineNumber: 51,
              columnNumber: 55
            }, this),
            pipeline.numberOfInvestors && /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Users, { size: 16, strokeWidth: 1.5 }, void 0, false, {
                fileName: "app/routes/_d.dashboard.tsx",
                lineNumber: 58,
                columnNumber: 29
              }, this),
              /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "text-gray-600", children: [
                pipeline.numberOfInvestors,
                " Investors"
              ] }, void 0, true, {
                fileName: "app/routes/_d.dashboard.tsx",
                lineNumber: 59,
                columnNumber: 29
              }, this)
            ] }, void 0, true, {
              fileName: "app/routes/_d.dashboard.tsx",
              lineNumber: 57,
              columnNumber: 56
            }, this)
          ] }, void 0, true, {
            fileName: "app/routes/_d.dashboard.tsx",
            lineNumber: 50,
            columnNumber: 23
          }, this)
        ] }, void 0, true, {
          fileName: "app/routes/_d.dashboard.tsx",
          lineNumber: 48,
          columnNumber: 21
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex items-center gap-4 w-full md:w-auto justify-start md:justify-end", children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, { to: `/pipeline/${pipeline.id}/form`, className: "flex items-center gap-2 border border-gray-200 rounded-lg p-2 hover:bg-gray-50", children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(SquarePen, { size: 16, strokeWidth: 1 }, void 0, false, {
              fileName: "app/routes/_d.dashboard.tsx",
              lineNumber: 67,
              columnNumber: 25
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: "Form" }, void 0, false, {
              fileName: "app/routes/_d.dashboard.tsx",
              lineNumber: 68,
              columnNumber: 25
            }, this)
          ] }, void 0, true, {
            fileName: "app/routes/_d.dashboard.tsx",
            lineNumber: 66,
            columnNumber: 23
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", { onClick: () => navigator.clipboard.writeText(`${window.location.origin}/${pipeline.id}/register`), className: "hover:text-blue-500 hover:bg-gray-50 transition-colors border border-gray-200 rounded-lg p-2", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link2, { size: 16, strokeWidth: 1 }, void 0, false, {
            fileName: "app/routes/_d.dashboard.tsx",
            lineNumber: 71,
            columnNumber: 25
          }, this) }, void 0, false, {
            fileName: "app/routes/_d.dashboard.tsx",
            lineNumber: 70,
            columnNumber: 23
          }, this)
        ] }, void 0, true, {
          fileName: "app/routes/_d.dashboard.tsx",
          lineNumber: 65,
          columnNumber: 21
        }, this)
      ] }, void 0, true, {
        fileName: "app/routes/_d.dashboard.tsx",
        lineNumber: 47,
        columnNumber: 19
      }, this) }, void 0, false, {
        fileName: "app/routes/_d.dashboard.tsx",
        lineNumber: 46,
        columnNumber: 17
      }, this) }, pipeline.id, false, {
        fileName: "app/routes/_d.dashboard.tsx",
        lineNumber: 45,
        columnNumber: 40
      }, this)) }, void 0, false, {
        fileName: "app/routes/_d.dashboard.tsx",
        lineNumber: 44,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "app/routes/_d.dashboard.tsx",
        lineNumber: 43,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/_d.dashboard.tsx",
      lineNumber: 41,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Link, { to: "/dashboard/create-pipeline", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, { className: "flex gap-2", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Plus, { size: 16 }, void 0, false, {
        fileName: "app/routes/_d.dashboard.tsx",
        lineNumber: 83,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { className: "pr-2", children: "Create" }, void 0, false, {
        fileName: "app/routes/_d.dashboard.tsx",
        lineNumber: 84,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/_d.dashboard.tsx",
      lineNumber: 82,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "app/routes/_d.dashboard.tsx",
      lineNumber: 81,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "app/routes/_d.dashboard.tsx",
      lineNumber: 80,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/_d.dashboard.tsx",
    lineNumber: 35,
    columnNumber: 10
  }, this);
}
_s(Dashboard, "V5pCuN4jinCqpbRaknBRKx5uxdk=", false, function() {
  return [useLoaderData];
});
_c = Dashboard;
var _c;
$RefreshReg$(_c, "Dashboard");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  Dashboard as default
};
//# sourceMappingURL=/build/routes/_d.dashboard-PQURTSB4.js.map
