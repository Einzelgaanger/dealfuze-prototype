import {
  require_client
} from "/build/_shared/chunk-GXSUA44W.js";
import {
  RemixBrowser,
  init_esm
} from "/build/_shared/chunk-7DEXXGJ3.js";
import {
  createHotContext,
  init_remix_hmr
} from "/build/_shared/chunk-O46JBUDP.js";
import "/build/_shared/chunk-M3R3PWNJ.js";
import "/build/_shared/chunk-6SFGVGP7.js";
import {
  require_jsx_dev_runtime
} from "/build/_shared/chunk-CXRXIBWZ.js";
import {
  require_react
} from "/build/_shared/chunk-FNINLW4T.js";
import {
  __toESM
} from "/build/_shared/chunk-PZDJHGND.js";

// app/entry.client.tsx
init_remix_hmr();
init_esm();
var import_react2 = __toESM(require_react(), 1);
var import_client = __toESM(require_client(), 1);
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\entry.client.tsx"
  );
  import.meta.hot.lastModified = "1746707235294.7185";
}
(0, import_react2.startTransition)(() => {
  (0, import_client.hydrateRoot)(
    document,
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_react2.StrictMode, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(RemixBrowser, {}, void 0, false, {
      fileName: "app/entry.client.tsx",
      lineNumber: 26,
      columnNumber: 7
    }, this) }, void 0, false, {
      fileName: "app/entry.client.tsx",
      lineNumber: 25,
      columnNumber: 5
    }, this)
  );
});
//# sourceMappingURL=/build/entry.client-THXDVHCY.js.map
