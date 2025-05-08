import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label
} from "/build/_shared/chunk-THYF4W65.js";
import {
  Button
} from "/build/_shared/chunk-AIKIHU6L.js";
import {
  require_dist
} from "/build/_shared/chunk-ELJJICGY.js";
import {
  require_ssr
} from "/build/_shared/chunk-BJ6Y6LHN.js";
import "/build/_shared/chunk-5ZGHMSNG.js";
import "/build/_shared/chunk-KUGFZWZA.js";
import {
  Form,
  init_esm,
  useNavigate
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

// app/routes/_auth.login.tsx
init_remix_hmr();
var import_remix = __toESM(require_dist(), 1);
var import_ssr = __toESM(require_ssr(), 1);
init_esm();
var import_react2 = __toESM(require_react(), 1);
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app\\\\routes\\\\_auth.login.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app\\routes\\_auth.login.tsx"
  );
  import.meta.hot.lastModified = "1746707235303.034";
}
function Login() {
  _s();
  const {
    signIn,
    setActive
  } = (0, import_remix.useSignIn)();
  const navigate = useNavigate();
  const [error, setError] = (0, import_react2.useState)(null);
  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const formData = new FormData(form);
    const email = formData.get("email");
    const password = formData.get("password");
    try {
      const result = await signIn?.create({
        identifier: email,
        password
      });
      if (result?.status === "complete") {
        await setActive?.({
          session: result.createdSessionId
        });
        navigate("/");
      }
    } catch (err) {
      setError("Invalid credentials");
    }
  };
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Dialog, { open: true, children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogContent, { showClose: false, children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogHeader, { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogTitle, { children: "Login" }, void 0, false, {
        fileName: "app/routes/_auth.login.tsx",
        lineNumber: 77,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogDescription, { children: "Please login to your Deal Fuze account." }, void 0, false, {
        fileName: "app/routes/_auth.login.tsx",
        lineNumber: 78,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/_auth.login.tsx",
      lineNumber: 76,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Form, { className: "grid gap-4", onSubmit: handleSubmit, noValidate: true, children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Label, { htmlFor: "email", children: "Email" }, void 0, false, {
          fileName: "app/routes/_auth.login.tsx",
          lineNumber: 84,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Input, { required: true, id: "email", name: "email", type: "email", autoComplete: "username", placeholder: "hello@dealfuze.com" }, void 0, false, {
          fileName: "app/routes/_auth.login.tsx",
          lineNumber: 85,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "app/routes/_auth.login.tsx",
        lineNumber: 83,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "grid gap-2", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Label, { htmlFor: "password", children: "Password" }, void 0, false, {
          fileName: "app/routes/_auth.login.tsx",
          lineNumber: 88,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Input, { required: true, id: "password", name: "password", type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", autoComplete: "current-password", minLength: 8 }, void 0, false, {
          fileName: "app/routes/_auth.login.tsx",
          lineNumber: 89,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "app/routes/_auth.login.tsx",
        lineNumber: 87,
        columnNumber: 11
      }, this),
      error && /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("p", { className: "text-red-500 text-sm", children: error }, void 0, false, {
        fileName: "app/routes/_auth.login.tsx",
        lineNumber: 91,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Button, { type: "submit", children: "Login" }, void 0, false, {
        fileName: "app/routes/_auth.login.tsx",
        lineNumber: 93,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "app/routes/_auth.login.tsx",
        lineNumber: 92,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/_auth.login.tsx",
      lineNumber: 82,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/_auth.login.tsx",
    lineNumber: 75,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "app/routes/_auth.login.tsx",
    lineNumber: 74,
    columnNumber: 10
  }, this);
}
_s(Login, "bFts3/W9RecCMVgGtGMgSSxsYLU=", false, function() {
  return [import_remix.useSignIn, useNavigate];
});
_c = Login;
var _c;
$RefreshReg$(_c, "Login");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  Login as default
};
//# sourceMappingURL=/build/routes/_auth.login-S7Q5MZYF.js.map
