import {
  esm_exports,
  init_esm
} from "/build/_shared/chunk-V76AKOHL.js";
import {
  require_react_dom
} from "/build/_shared/chunk-6SFGVGP7.js";
import {
  require_react
} from "/build/_shared/chunk-FNINLW4T.js";
import {
  __commonJS,
  __toCommonJS
} from "/build/_shared/chunk-PZDJHGND.js";

// ../node_modules/@clerk/remix/dist/globalPolyfill.js
var require_globalPolyfill = __commonJS({
  "../node_modules/@clerk/remix/dist/globalPolyfill.js"() {
    "use strict";
    if (typeof window !== "undefined" && typeof window.global === "undefined") {
      window.global = window;
    }
  }
});

// ../node_modules/@clerk/shared/dist/loadClerkJsScript.js
var require_loadClerkJsScript = __commonJS({
  "../node_modules/@clerk/shared/dist/loadClerkJsScript.js"(exports, module) {
    "use strict";
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS2 = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
    var loadClerkJsScript_exports = {};
    __export(loadClerkJsScript_exports, {
      buildClerkJsScriptAttributes: () => buildClerkJsScriptAttributes2,
      clerkJsScriptUrl: () => clerkJsScriptUrl2,
      loadClerkJsScript: () => loadClerkJsScript,
      setClerkJsLoadingErrorPackageName: () => setClerkJsLoadingErrorPackageName2
    });
    module.exports = __toCommonJS2(loadClerkJsScript_exports);
    var DefaultMessages = Object.freeze({
      InvalidProxyUrlErrorMessage: `The proxyUrl passed to Clerk is invalid. The expected value for proxyUrl is an absolute URL or a relative path with a leading '/'. (key={{url}})`,
      InvalidPublishableKeyErrorMessage: `The publishableKey passed to Clerk is invalid. You can get your Publishable key at https://dashboard.clerk.com/last-active?path=api-keys. (key={{key}})`,
      MissingPublishableKeyErrorMessage: `Missing publishableKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.`,
      MissingSecretKeyErrorMessage: `Missing secretKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.`,
      MissingClerkProvider: `{{source}} can only be used within the <ClerkProvider /> component. Learn more: https://clerk.com/docs/components/clerk-provider`
    });
    function buildErrorThrower({ packageName, customMessages }) {
      let pkg = packageName;
      const messages = {
        ...DefaultMessages,
        ...customMessages
      };
      function buildMessage(rawMessage, replacements) {
        if (!replacements) {
          return `${pkg}: ${rawMessage}`;
        }
        let msg = rawMessage;
        const matches = rawMessage.matchAll(/{{([a-zA-Z0-9-_]+)}}/g);
        for (const match of matches) {
          const replacement = (replacements[match[1]] || "").toString();
          msg = msg.replace(`{{${match[1]}}}`, replacement);
        }
        return `${pkg}: ${msg}`;
      }
      return {
        setPackageName({ packageName: packageName2 }) {
          if (typeof packageName2 === "string") {
            pkg = packageName2;
          }
          return this;
        },
        setMessages({ customMessages: customMessages2 }) {
          Object.assign(messages, customMessages2 || {});
          return this;
        },
        throwInvalidPublishableKeyError(params) {
          throw new Error(buildMessage(messages.InvalidPublishableKeyErrorMessage, params));
        },
        throwInvalidProxyUrl(params) {
          throw new Error(buildMessage(messages.InvalidProxyUrlErrorMessage, params));
        },
        throwMissingPublishableKeyError() {
          throw new Error(buildMessage(messages.MissingPublishableKeyErrorMessage));
        },
        throwMissingSecretKeyError() {
          throw new Error(buildMessage(messages.MissingSecretKeyErrorMessage));
        },
        throwMissingClerkProviderError(params) {
          throw new Error(buildMessage(messages.MissingClerkProvider, params));
        },
        throw(message) {
          throw new Error(buildMessage(message));
        }
      };
    }
    var DEV_OR_STAGING_SUFFIXES = [
      ".lcl.dev",
      ".stg.dev",
      ".lclstage.dev",
      ".stgstage.dev",
      ".dev.lclclerk.com",
      ".stg.lclclerk.com",
      ".accounts.lclclerk.com",
      "accountsstage.dev",
      "accounts.dev"
    ];
    var isomorphicAtob = (data) => {
      if (typeof atob !== "undefined" && typeof atob === "function") {
        return atob(data);
      } else if (typeof globalThis !== "undefined" && globalThis.Buffer) {
        return new globalThis.Buffer(data, "base64").toString();
      }
      return data;
    };
    var PUBLISHABLE_KEY_LIVE_PREFIX = "pk_live_";
    var PUBLISHABLE_KEY_TEST_PREFIX = "pk_test_";
    function parsePublishableKey(key, options = {}) {
      key = key || "";
      if (!key || !isPublishableKey(key)) {
        if (options.fatal && !key) {
          throw new Error(
            "Publishable key is missing. Ensure that your publishable key is correctly configured. Double-check your environment configuration for your keys, or access them here: https://dashboard.clerk.com/last-active?path=api-keys"
          );
        }
        if (options.fatal && !isPublishableKey(key)) {
          throw new Error("Publishable key not valid.");
        }
        return null;
      }
      const instanceType = key.startsWith(PUBLISHABLE_KEY_LIVE_PREFIX) ? "production" : "development";
      let frontendApi = isomorphicAtob(key.split("_")[2]);
      frontendApi = frontendApi.slice(0, -1);
      if (options.proxyUrl) {
        frontendApi = options.proxyUrl;
      } else if (instanceType !== "development" && options.domain) {
        frontendApi = `clerk.${options.domain}`;
      }
      return {
        instanceType,
        frontendApi
      };
    }
    function isPublishableKey(key = "") {
      try {
        const hasValidPrefix = key.startsWith(PUBLISHABLE_KEY_LIVE_PREFIX) || key.startsWith(PUBLISHABLE_KEY_TEST_PREFIX);
        const hasValidFrontendApiPostfix = isomorphicAtob(key.split("_")[2] || "").endsWith("$");
        return hasValidPrefix && hasValidFrontendApiPostfix;
      } catch {
        return false;
      }
    }
    function createDevOrStagingUrlCache() {
      const devOrStagingUrlCache = /* @__PURE__ */ new Map();
      return {
        isDevOrStagingUrl: (url) => {
          if (!url) {
            return false;
          }
          const hostname = typeof url === "string" ? url : url.hostname;
          let res = devOrStagingUrlCache.get(hostname);
          if (res === void 0) {
            res = DEV_OR_STAGING_SUFFIXES.some((s) => hostname.endsWith(s));
            devOrStagingUrlCache.set(hostname, res);
          }
          return res;
        }
      };
    }
    var defaultOptions = {
      initialDelay: 125,
      maxDelayBetweenRetries: 0,
      factor: 2,
      shouldRetry: (_, iteration) => iteration < 5,
      retryImmediately: false,
      jitter: true
    };
    var RETRY_IMMEDIATELY_DELAY = 100;
    var sleep = async (ms) => new Promise((s) => setTimeout(s, ms));
    var applyJitter = (delay, jitter) => {
      return jitter ? delay * (1 + Math.random()) : delay;
    };
    var createExponentialDelayAsyncFn = (opts) => {
      let timesCalled = 0;
      const calculateDelayInMs = () => {
        const constant = opts.initialDelay;
        const base = opts.factor;
        let delay = constant * Math.pow(base, timesCalled);
        delay = applyJitter(delay, opts.jitter);
        return Math.min(opts.maxDelayBetweenRetries || delay, delay);
      };
      return async () => {
        await sleep(calculateDelayInMs());
        timesCalled++;
      };
    };
    var retry = async (callback, options = {}) => {
      let iterations = 0;
      const { shouldRetry, initialDelay, maxDelayBetweenRetries, factor, retryImmediately, jitter } = {
        ...defaultOptions,
        ...options
      };
      const delay = createExponentialDelayAsyncFn({
        initialDelay,
        maxDelayBetweenRetries,
        factor,
        jitter
      });
      while (true) {
        try {
          return await callback();
        } catch (e) {
          iterations++;
          if (!shouldRetry(e, iterations)) {
            throw e;
          }
          if (retryImmediately && iterations === 1) {
            await sleep(applyJitter(RETRY_IMMEDIATELY_DELAY, jitter));
          } else {
            await delay();
          }
        }
      }
    };
    var NO_DOCUMENT_ERROR = "loadScript cannot be called when document does not exist";
    var NO_SRC_ERROR = "loadScript cannot be called without a src";
    async function loadScript(src = "", opts) {
      const { async, defer, beforeLoad, crossOrigin, nonce } = opts || {};
      const load = () => {
        return new Promise((resolve, reject) => {
          if (!src) {
            reject(new Error(NO_SRC_ERROR));
          }
          if (!document || !document.body) {
            reject(NO_DOCUMENT_ERROR);
          }
          const script = document.createElement("script");
          if (crossOrigin)
            script.setAttribute("crossorigin", crossOrigin);
          script.async = async || false;
          script.defer = defer || false;
          script.addEventListener("load", () => {
            script.remove();
            resolve(script);
          });
          script.addEventListener("error", () => {
            script.remove();
            reject();
          });
          script.src = src;
          script.nonce = nonce;
          beforeLoad?.(script);
          document.body.appendChild(script);
        });
      };
      return retry(load, { shouldRetry: (_, iterations) => iterations <= 5 });
    }
    function isValidProxyUrl(key) {
      if (!key) {
        return true;
      }
      return isHttpOrHttps(key) || isProxyUrlRelative(key);
    }
    function isHttpOrHttps(key) {
      return /^http(s)?:\/\//.test(key || "");
    }
    function isProxyUrlRelative(key) {
      return key.startsWith("/");
    }
    function proxyUrlToAbsoluteURL(url) {
      if (!url) {
        return "";
      }
      return isProxyUrlRelative(url) ? new URL(url, window.location.origin).toString() : url;
    }
    function addClerkPrefix(str) {
      if (!str) {
        return "";
      }
      let regex;
      if (str.match(/^(clerk\.)+\w*$/)) {
        regex = /(clerk\.)*(?=clerk\.)/;
      } else if (str.match(/\.clerk.accounts/)) {
        return str;
      } else {
        regex = /^(clerk\.)*/gi;
      }
      const stripped = str.replace(regex, "");
      return `clerk.${stripped}`;
    }
    var versionSelector = (clerkJSVersion, packageVersion = "5.63.5") => {
      if (clerkJSVersion) {
        return clerkJSVersion;
      }
      const prereleaseTag = getPrereleaseTag(packageVersion);
      if (prereleaseTag) {
        if (prereleaseTag === "snapshot") {
          return "5.63.5";
        }
        return prereleaseTag;
      }
      return getMajorVersion(packageVersion);
    };
    var getPrereleaseTag = (packageVersion) => packageVersion.trim().replace(/^v/, "").match(/-(.+?)(\.|$)/)?.[1];
    var getMajorVersion = (packageVersion) => packageVersion.trim().replace(/^v/, "").split(".")[0];
    var FAILED_TO_LOAD_ERROR = "Clerk: Failed to load Clerk";
    var { isDevOrStagingUrl } = createDevOrStagingUrlCache();
    var errorThrower = buildErrorThrower({ packageName: "@clerk/shared" });
    function setClerkJsLoadingErrorPackageName2(packageName) {
      errorThrower.setPackageName({ packageName });
    }
    var loadClerkJsScript = async (opts) => {
      const existingScript = document.querySelector("script[data-clerk-js-script]");
      if (existingScript) {
        return new Promise((resolve, reject) => {
          existingScript.addEventListener("load", () => {
            resolve(existingScript);
          });
          existingScript.addEventListener("error", () => {
            reject(FAILED_TO_LOAD_ERROR);
          });
        });
      }
      if (!opts?.publishableKey) {
        errorThrower.throwMissingPublishableKeyError();
        return;
      }
      return loadScript(clerkJsScriptUrl2(opts), {
        async: true,
        crossOrigin: "anonymous",
        nonce: opts.nonce,
        beforeLoad: applyClerkJsScriptAttributes(opts)
      }).catch(() => {
        throw new Error(FAILED_TO_LOAD_ERROR);
      });
    };
    var clerkJsScriptUrl2 = (opts) => {
      const { clerkJSUrl, clerkJSVariant, clerkJSVersion, proxyUrl, domain, publishableKey } = opts;
      if (clerkJSUrl) {
        return clerkJSUrl;
      }
      let scriptHost = "";
      if (!!proxyUrl && isValidProxyUrl(proxyUrl)) {
        scriptHost = proxyUrlToAbsoluteURL(proxyUrl).replace(/http(s)?:\/\//, "");
      } else if (domain && !isDevOrStagingUrl(parsePublishableKey(publishableKey)?.frontendApi || "")) {
        scriptHost = addClerkPrefix(domain);
      } else {
        scriptHost = parsePublishableKey(publishableKey)?.frontendApi || "";
      }
      const variant = clerkJSVariant ? `${clerkJSVariant.replace(/\.+$/, "")}.` : "";
      const version = versionSelector(clerkJSVersion);
      return `https://${scriptHost}/npm/@clerk/clerk-js@${version}/dist/clerk.${variant}browser.js`;
    };
    var buildClerkJsScriptAttributes2 = (options) => {
      const obj = {};
      if (options.publishableKey) {
        obj["data-clerk-publishable-key"] = options.publishableKey;
      }
      if (options.proxyUrl) {
        obj["data-clerk-proxy-url"] = options.proxyUrl;
      }
      if (options.domain) {
        obj["data-clerk-domain"] = options.domain;
      }
      if (options.nonce) {
        obj.nonce = options.nonce;
      }
      return obj;
    };
    var applyClerkJsScriptAttributes = (options) => (script) => {
      const attributes = buildClerkJsScriptAttributes2(options);
      for (const attribute in attributes) {
        script.setAttribute(attribute, attributes[attribute]);
      }
    };
  }
});

// ../node_modules/@clerk/shared/dist/error.js
var require_error = __commonJS({
  "../node_modules/@clerk/shared/dist/error.js"(exports, module) {
    "use strict";
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS2 = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
    var error_exports = {};
    __export(error_exports, {
      ClerkAPIResponseError: () => ClerkAPIResponseError,
      ClerkRuntimeError: () => ClerkRuntimeError,
      ClerkWebAuthnError: () => ClerkWebAuthnError,
      EmailLinkError: () => EmailLinkError,
      EmailLinkErrorCode: () => EmailLinkErrorCode,
      EmailLinkErrorCodeStatus: () => EmailLinkErrorCodeStatus,
      buildErrorThrower: () => buildErrorThrower,
      errorToJSON: () => errorToJSON,
      is4xxError: () => is4xxError,
      isCaptchaError: () => isCaptchaError,
      isClerkAPIResponseError: () => isClerkAPIResponseError,
      isClerkRuntimeError: () => isClerkRuntimeError,
      isEmailLinkError: () => isEmailLinkError,
      isKnownError: () => isKnownError,
      isMetamaskError: () => isMetamaskError,
      isNetworkError: () => isNetworkError,
      isPasswordPwnedError: () => isPasswordPwnedError,
      isReverificationCancelledError: () => isReverificationCancelledError,
      isUnauthorizedError: () => isUnauthorizedError,
      isUserLockedError: () => isUserLockedError,
      parseError: () => parseError,
      parseErrors: () => parseErrors
    });
    module.exports = __toCommonJS2(error_exports);
    function isUnauthorizedError(e) {
      const status = e?.status;
      const code = e?.errors?.[0]?.code;
      return code === "authentication_invalid" && status === 401;
    }
    function isCaptchaError(e) {
      return ["captcha_invalid", "captcha_not_enabled", "captcha_missing_token"].includes(e.errors[0].code);
    }
    function is4xxError(e) {
      const status = e?.status;
      return !!status && status >= 400 && status < 500;
    }
    function isNetworkError(e) {
      const message = (`${e.message}${e.name}` || "").toLowerCase().replace(/\s+/g, "");
      return message.includes("networkerror");
    }
    function isKnownError(error) {
      return isClerkAPIResponseError(error) || isMetamaskError(error) || isClerkRuntimeError(error);
    }
    function isClerkAPIResponseError(err) {
      return "clerkError" in err;
    }
    function isClerkRuntimeError(err) {
      return "clerkRuntimeError" in err;
    }
    function isReverificationCancelledError(err) {
      return isClerkRuntimeError(err) && err.code === "reverification_cancelled";
    }
    function isMetamaskError(err) {
      return "code" in err && [4001, 32602, 32603].includes(err.code) && "message" in err;
    }
    function isUserLockedError(err) {
      return isClerkAPIResponseError(err) && err.errors?.[0]?.code === "user_locked";
    }
    function isPasswordPwnedError(err) {
      return isClerkAPIResponseError(err) && err.errors?.[0]?.code === "form_password_pwned";
    }
    function parseErrors(data = []) {
      return data.length > 0 ? data.map(parseError) : [];
    }
    function parseError(error) {
      return {
        code: error.code,
        message: error.message,
        longMessage: error.long_message,
        meta: {
          paramName: error?.meta?.param_name,
          sessionId: error?.meta?.session_id,
          emailAddresses: error?.meta?.email_addresses,
          identifiers: error?.meta?.identifiers,
          zxcvbn: error?.meta?.zxcvbn
        }
      };
    }
    function errorToJSON(error) {
      return {
        code: error?.code || "",
        message: error?.message || "",
        long_message: error?.longMessage,
        meta: {
          param_name: error?.meta?.paramName,
          session_id: error?.meta?.sessionId,
          email_addresses: error?.meta?.emailAddresses,
          identifiers: error?.meta?.identifiers,
          zxcvbn: error?.meta?.zxcvbn
        }
      };
    }
    var ClerkAPIResponseError = class _ClerkAPIResponseError extends Error {
      constructor(message, { data, status, clerkTraceId, retryAfter }) {
        super(message);
        this.toString = () => {
          let message2 = `[${this.name}]
Message:${this.message}
Status:${this.status}
Serialized errors: ${this.errors.map(
            (e) => JSON.stringify(e)
          )}`;
          if (this.clerkTraceId) {
            message2 += `
Clerk Trace ID: ${this.clerkTraceId}`;
          }
          return message2;
        };
        Object.setPrototypeOf(this, _ClerkAPIResponseError.prototype);
        this.status = status;
        this.message = message;
        this.clerkTraceId = clerkTraceId;
        this.retryAfter = retryAfter;
        this.clerkError = true;
        this.errors = parseErrors(data);
      }
    };
    var ClerkRuntimeError = class _ClerkRuntimeError extends Error {
      constructor(message, { code }) {
        const prefix = "\u{1F512} Clerk:";
        const regex = new RegExp(prefix.replace(" ", "\\s*"), "i");
        const sanitized = message.replace(regex, "");
        const _message = `${prefix} ${sanitized.trim()}

(code="${code}")
`;
        super(_message);
        this.toString = () => {
          return `[${this.name}]
Message:${this.message}`;
        };
        Object.setPrototypeOf(this, _ClerkRuntimeError.prototype);
        this.code = code;
        this.message = _message;
        this.clerkRuntimeError = true;
        this.name = "ClerkRuntimeError";
      }
    };
    var EmailLinkError = class _EmailLinkError extends Error {
      constructor(code) {
        super(code);
        this.code = code;
        this.name = "EmailLinkError";
        Object.setPrototypeOf(this, _EmailLinkError.prototype);
      }
    };
    function isEmailLinkError(err) {
      return err.name === "EmailLinkError";
    }
    var EmailLinkErrorCode = {
      Expired: "expired",
      Failed: "failed",
      ClientMismatch: "client_mismatch"
    };
    var EmailLinkErrorCodeStatus = {
      Expired: "expired",
      Failed: "failed",
      ClientMismatch: "client_mismatch"
    };
    var DefaultMessages = Object.freeze({
      InvalidProxyUrlErrorMessage: `The proxyUrl passed to Clerk is invalid. The expected value for proxyUrl is an absolute URL or a relative path with a leading '/'. (key={{url}})`,
      InvalidPublishableKeyErrorMessage: `The publishableKey passed to Clerk is invalid. You can get your Publishable key at https://dashboard.clerk.com/last-active?path=api-keys. (key={{key}})`,
      MissingPublishableKeyErrorMessage: `Missing publishableKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.`,
      MissingSecretKeyErrorMessage: `Missing secretKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.`,
      MissingClerkProvider: `{{source}} can only be used within the <ClerkProvider /> component. Learn more: https://clerk.com/docs/components/clerk-provider`
    });
    function buildErrorThrower({ packageName, customMessages }) {
      let pkg = packageName;
      const messages = {
        ...DefaultMessages,
        ...customMessages
      };
      function buildMessage(rawMessage, replacements) {
        if (!replacements) {
          return `${pkg}: ${rawMessage}`;
        }
        let msg = rawMessage;
        const matches = rawMessage.matchAll(/{{([a-zA-Z0-9-_]+)}}/g);
        for (const match of matches) {
          const replacement = (replacements[match[1]] || "").toString();
          msg = msg.replace(`{{${match[1]}}}`, replacement);
        }
        return `${pkg}: ${msg}`;
      }
      return {
        setPackageName({ packageName: packageName2 }) {
          if (typeof packageName2 === "string") {
            pkg = packageName2;
          }
          return this;
        },
        setMessages({ customMessages: customMessages2 }) {
          Object.assign(messages, customMessages2 || {});
          return this;
        },
        throwInvalidPublishableKeyError(params) {
          throw new Error(buildMessage(messages.InvalidPublishableKeyErrorMessage, params));
        },
        throwInvalidProxyUrl(params) {
          throw new Error(buildMessage(messages.InvalidProxyUrlErrorMessage, params));
        },
        throwMissingPublishableKeyError() {
          throw new Error(buildMessage(messages.MissingPublishableKeyErrorMessage));
        },
        throwMissingSecretKeyError() {
          throw new Error(buildMessage(messages.MissingSecretKeyErrorMessage));
        },
        throwMissingClerkProviderError(params) {
          throw new Error(buildMessage(messages.MissingClerkProvider, params));
        },
        throw(message) {
          throw new Error(buildMessage(message));
        }
      };
    }
    var ClerkWebAuthnError = class extends ClerkRuntimeError {
      constructor(message, { code }) {
        super(message, { code });
        this.code = code;
      }
    };
  }
});

// ../node_modules/@clerk/shared/dist/utils/index.js
var require_utils = __commonJS({
  "../node_modules/@clerk/shared/dist/utils/index.js"(exports, module) {
    "use strict";
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS2 = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
    var utils_exports = {};
    __export(utils_exports, {
      allSettled: () => allSettled,
      createDeferredPromise: () => createDeferredPromise,
      fastDeepMergeAndKeep: () => fastDeepMergeAndKeep,
      fastDeepMergeAndReplace: () => fastDeepMergeAndReplace,
      handleValueOrFn: () => handleValueOrFn,
      isDevelopmentEnvironment: () => isDevelopmentEnvironment,
      isProductionEnvironment: () => isProductionEnvironment,
      isStaging: () => isStaging,
      isTestEnvironment: () => isTestEnvironment,
      logErrorInDevMode: () => logErrorInDevMode,
      noop: () => noop
    });
    module.exports = __toCommonJS2(utils_exports);
    var noop = (..._args) => {
    };
    var createDeferredPromise = () => {
      let resolve = noop;
      let reject = noop;
      const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    };
    function allSettled(iterable) {
      const promises = Array.from(iterable).map(
        (p) => p.then(
          (value) => ({ status: "fulfilled", value }),
          (reason) => ({ status: "rejected", reason })
        )
      );
      return Promise.all(promises);
    }
    function isStaging(frontendApi) {
      return frontendApi.endsWith(".lclstage.dev") || frontendApi.endsWith(".stgstage.dev") || frontendApi.endsWith(".clerkstage.dev") || frontendApi.endsWith(".accountsstage.dev");
    }
    var isDevelopmentEnvironment = () => {
      try {
        return true;
      } catch {
      }
      return false;
    };
    var isTestEnvironment = () => {
      try {
        return false;
      } catch {
      }
      return false;
    };
    var isProductionEnvironment = () => {
      try {
        return false;
      } catch {
      }
      return false;
    };
    var logErrorInDevMode = (message) => {
      if (isDevelopmentEnvironment()) {
        console.error(`Clerk: ${message}`);
      }
    };
    function handleValueOrFn(value, url, defaultValue) {
      if (typeof value === "function") {
        return value(url);
      }
      if (typeof value !== "undefined") {
        return value;
      }
      if (typeof defaultValue !== "undefined") {
        return defaultValue;
      }
      return void 0;
    }
    var fastDeepMergeAndReplace = (source, target) => {
      if (!source || !target) {
        return;
      }
      for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key) && source[key] !== null && typeof source[key] === `object`) {
          if (target[key] === void 0) {
            target[key] = new (Object.getPrototypeOf(source[key])).constructor();
          }
          fastDeepMergeAndReplace(source[key], target[key]);
        } else if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    };
    var fastDeepMergeAndKeep = (source, target) => {
      if (!source || !target) {
        return;
      }
      for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key) && source[key] !== null && typeof source[key] === `object`) {
          if (target[key] === void 0) {
            target[key] = new (Object.getPrototypeOf(source[key])).constructor();
          }
          fastDeepMergeAndKeep(source[key], target[key]);
        } else if (Object.prototype.hasOwnProperty.call(source, key) && target[key] === void 0) {
          target[key] = source[key];
        }
      }
    };
  }
});

// ../node_modules/@clerk/shared/dist/object.js
var require_object = __commonJS({
  "../node_modules/@clerk/shared/dist/object.js"(exports, module) {
    "use strict";
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS2 = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
    var object_exports = {};
    __export(object_exports, {
      applyFunctionToObj: () => applyFunctionToObj,
      filterProps: () => filterProps,
      removeUndefined: () => removeUndefined,
      without: () => without
    });
    module.exports = __toCommonJS2(object_exports);
    var without = (obj, ...props) => {
      const copy = { ...obj };
      for (const prop of props) {
        delete copy[prop];
      }
      return copy;
    };
    var removeUndefined = (obj) => {
      return Object.entries(obj).reduce((acc, [key, value]) => {
        if (value !== void 0 && value !== null) {
          acc[key] = value;
        }
        return acc;
      }, {});
    };
    var applyFunctionToObj = (obj, fn) => {
      const result = {};
      for (const key in obj) {
        result[key] = fn(obj[key], key);
      }
      return result;
    };
    var filterProps = (obj, filter) => {
      const result = {};
      for (const key in obj) {
        if (obj[key] && filter(obj[key])) {
          result[key] = obj[key];
        }
      }
      return result;
    };
  }
});

// ../node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.development.js
var require_use_sync_external_store_shim_development = __commonJS({
  "../node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.development.js"(exports) {
    "use strict";
    (function() {
      function is(x, y) {
        return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
      }
      function useSyncExternalStore$2(subscribe, getSnapshot) {
        didWarnOld18Alpha || void 0 === React.startTransition || (didWarnOld18Alpha = true, console.error(
          "You are using an outdated, pre-release alpha of React 18 that does not support useSyncExternalStore. The use-sync-external-store shim will not work correctly. Upgrade to a newer pre-release."
        ));
        var value = getSnapshot();
        if (!didWarnUncachedGetSnapshot) {
          var cachedValue = getSnapshot();
          objectIs(value, cachedValue) || (console.error(
            "The result of getSnapshot should be cached to avoid an infinite loop"
          ), didWarnUncachedGetSnapshot = true);
        }
        cachedValue = useState({
          inst: { value, getSnapshot }
        });
        var inst = cachedValue[0].inst, forceUpdate = cachedValue[1];
        useLayoutEffect(
          function() {
            inst.value = value;
            inst.getSnapshot = getSnapshot;
            checkIfSnapshotChanged(inst) && forceUpdate({ inst });
          },
          [subscribe, value, getSnapshot]
        );
        useEffect(
          function() {
            checkIfSnapshotChanged(inst) && forceUpdate({ inst });
            return subscribe(function() {
              checkIfSnapshotChanged(inst) && forceUpdate({ inst });
            });
          },
          [subscribe]
        );
        useDebugValue(value);
        return value;
      }
      function checkIfSnapshotChanged(inst) {
        var latestGetSnapshot = inst.getSnapshot;
        inst = inst.value;
        try {
          var nextValue = latestGetSnapshot();
          return !objectIs(inst, nextValue);
        } catch (error) {
          return true;
        }
      }
      function useSyncExternalStore$1(subscribe, getSnapshot) {
        return getSnapshot();
      }
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
      var React = require_react(), objectIs = "function" === typeof Object.is ? Object.is : is, useState = React.useState, useEffect = React.useEffect, useLayoutEffect = React.useLayoutEffect, useDebugValue = React.useDebugValue, didWarnOld18Alpha = false, didWarnUncachedGetSnapshot = false, shim = "undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement ? useSyncExternalStore$1 : useSyncExternalStore$2;
      exports.useSyncExternalStore = void 0 !== React.useSyncExternalStore ? React.useSyncExternalStore : shim;
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
    })();
  }
});

// ../node_modules/use-sync-external-store/shim/index.js
var require_shim = __commonJS({
  "../node_modules/use-sync-external-store/shim/index.js"(exports, module) {
    "use strict";
    if (false) {
      module.exports = null;
    } else {
      module.exports = require_use_sync_external_store_shim_development();
    }
  }
});

// ../node_modules/swr/dist/_internal/events.js
var require_events = __commonJS({
  "../node_modules/swr/dist/_internal/events.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var FOCUS_EVENT = 0;
    var RECONNECT_EVENT = 1;
    var MUTATE_EVENT = 2;
    var ERROR_REVALIDATE_EVENT = 3;
    exports.ERROR_REVALIDATE_EVENT = ERROR_REVALIDATE_EVENT;
    exports.FOCUS_EVENT = FOCUS_EVENT;
    exports.MUTATE_EVENT = MUTATE_EVENT;
    exports.RECONNECT_EVENT = RECONNECT_EVENT;
  }
});

// ../node_modules/dequal/lite/index.js
var require_lite = __commonJS({
  "../node_modules/dequal/lite/index.js"(exports) {
    var has = Object.prototype.hasOwnProperty;
    function dequal(foo, bar) {
      var ctor, len;
      if (foo === bar)
        return true;
      if (foo && bar && (ctor = foo.constructor) === bar.constructor) {
        if (ctor === Date)
          return foo.getTime() === bar.getTime();
        if (ctor === RegExp)
          return foo.toString() === bar.toString();
        if (ctor === Array) {
          if ((len = foo.length) === bar.length) {
            while (len-- && dequal(foo[len], bar[len]))
              ;
          }
          return len === -1;
        }
        if (!ctor || typeof foo === "object") {
          len = 0;
          for (ctor in foo) {
            if (has.call(foo, ctor) && ++len && !has.call(bar, ctor))
              return false;
            if (!(ctor in bar) || !dequal(foo[ctor], bar[ctor]))
              return false;
          }
          return Object.keys(bar).length === len;
        }
      }
      return foo !== foo && bar !== bar;
    }
    exports.dequal = dequal;
  }
});

// ../node_modules/swr/dist/_internal/config-context-client-BXAm5QZy.js
var require_config_context_client_BXAm5QZy = __commonJS({
  "../node_modules/swr/dist/_internal/config-context-client-BXAm5QZy.js"(exports) {
    "use client";
    var React = require_react();
    var revalidateEvents = require_events();
    var lite = require_lite();
    function _interopDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function _interopNamespace(e) {
      if (e && e.__esModule)
        return e;
      var n = /* @__PURE__ */ Object.create(null);
      if (e) {
        Object.keys(e).forEach(function(k) {
          if (k !== "default") {
            var d = Object.getOwnPropertyDescriptor(e, k);
            Object.defineProperty(n, k, d.get ? d : {
              enumerable: true,
              get: function() {
                return e[k];
              }
            });
          }
        });
      }
      n.default = e;
      return n;
    }
    var React__default = /* @__PURE__ */ _interopDefault(React);
    var revalidateEvents__namespace = /* @__PURE__ */ _interopNamespace(revalidateEvents);
    var SWRGlobalState = /* @__PURE__ */ new WeakMap();
    var noop = () => {
    };
    var UNDEFINED = (
      /*#__NOINLINE__*/
      noop()
    );
    var OBJECT = Object;
    var isUndefined = (v) => v === UNDEFINED;
    var isFunction = (v) => typeof v == "function";
    var mergeObjects = (a, b) => ({
      ...a,
      ...b
    });
    var isPromiseLike = (x) => isFunction(x.then);
    var EMPTY_CACHE = {};
    var INITIAL_CACHE = {};
    var STR_UNDEFINED = "undefined";
    var isWindowDefined = typeof window != STR_UNDEFINED;
    var isDocumentDefined = typeof document != STR_UNDEFINED;
    var isLegacyDeno = isWindowDefined && "Deno" in window;
    var hasRequestAnimationFrame = () => isWindowDefined && typeof window["requestAnimationFrame"] != STR_UNDEFINED;
    var createCacheHelper = (cache2, key) => {
      const state = SWRGlobalState.get(cache2);
      return [
        // Getter
        () => !isUndefined(key) && cache2.get(key) || EMPTY_CACHE,
        // Setter
        (info) => {
          if (!isUndefined(key)) {
            const prev = cache2.get(key);
            if (!(key in INITIAL_CACHE)) {
              INITIAL_CACHE[key] = prev;
            }
            state[5](key, mergeObjects(prev, info), prev || EMPTY_CACHE);
          }
        },
        // Subscriber
        state[6],
        // Get server cache snapshot
        () => {
          if (!isUndefined(key)) {
            if (key in INITIAL_CACHE)
              return INITIAL_CACHE[key];
          }
          return !isUndefined(key) && cache2.get(key) || EMPTY_CACHE;
        }
      ];
    };
    var online = true;
    var isOnline = () => online;
    var [onWindowEvent, offWindowEvent] = isWindowDefined && window.addEventListener ? [
      window.addEventListener.bind(window),
      window.removeEventListener.bind(window)
    ] : [
      noop,
      noop
    ];
    var isVisible = () => {
      const visibilityState = isDocumentDefined && document.visibilityState;
      return isUndefined(visibilityState) || visibilityState !== "hidden";
    };
    var initFocus = (callback) => {
      if (isDocumentDefined) {
        document.addEventListener("visibilitychange", callback);
      }
      onWindowEvent("focus", callback);
      return () => {
        if (isDocumentDefined) {
          document.removeEventListener("visibilitychange", callback);
        }
        offWindowEvent("focus", callback);
      };
    };
    var initReconnect = (callback) => {
      const onOnline = () => {
        online = true;
        callback();
      };
      const onOffline = () => {
        online = false;
      };
      onWindowEvent("online", onOnline);
      onWindowEvent("offline", onOffline);
      return () => {
        offWindowEvent("online", onOnline);
        offWindowEvent("offline", onOffline);
      };
    };
    var preset = {
      isOnline,
      isVisible
    };
    var defaultConfigOptions = {
      initFocus,
      initReconnect
    };
    var IS_REACT_LEGACY = !React__default.default.useId;
    var IS_SERVER = !isWindowDefined || isLegacyDeno;
    var rAF = (f) => hasRequestAnimationFrame() ? window["requestAnimationFrame"](f) : setTimeout(f, 1);
    var useIsomorphicLayoutEffect = IS_SERVER ? React.useEffect : React.useLayoutEffect;
    var navigatorConnection = typeof navigator !== "undefined" && navigator.connection;
    var slowConnection = !IS_SERVER && navigatorConnection && ([
      "slow-2g",
      "2g"
    ].includes(navigatorConnection.effectiveType) || navigatorConnection.saveData);
    var table = /* @__PURE__ */ new WeakMap();
    var isObjectType = (value, type) => OBJECT.prototype.toString.call(value) === `[object ${type}]`;
    var counter = 0;
    var stableHash = (arg) => {
      const type = typeof arg;
      const isDate = isObjectType(arg, "Date");
      const isRegex = isObjectType(arg, "RegExp");
      const isPlainObject = isObjectType(arg, "Object");
      let result;
      let index;
      if (OBJECT(arg) === arg && !isDate && !isRegex) {
        result = table.get(arg);
        if (result)
          return result;
        result = ++counter + "~";
        table.set(arg, result);
        if (Array.isArray(arg)) {
          result = "@";
          for (index = 0; index < arg.length; index++) {
            result += stableHash(arg[index]) + ",";
          }
          table.set(arg, result);
        }
        if (isPlainObject) {
          result = "#";
          const keys = OBJECT.keys(arg).sort();
          while (!isUndefined(index = keys.pop())) {
            if (!isUndefined(arg[index])) {
              result += index + ":" + stableHash(arg[index]) + ",";
            }
          }
          table.set(arg, result);
        }
      } else {
        result = isDate ? arg.toJSON() : type == "symbol" ? arg.toString() : type == "string" ? JSON.stringify(arg) : "" + arg;
      }
      return result;
    };
    var serialize = (key) => {
      if (isFunction(key)) {
        try {
          key = key();
        } catch (err) {
          key = "";
        }
      }
      const args = key;
      key = typeof key == "string" ? key : (Array.isArray(key) ? key.length : key) ? stableHash(key) : "";
      return [
        key,
        args
      ];
    };
    var __timestamp = 0;
    var getTimestamp = () => ++__timestamp;
    async function internalMutate(...args) {
      const [cache2, _key, _data, _opts] = args;
      const options = mergeObjects({
        populateCache: true,
        throwOnError: true
      }, typeof _opts === "boolean" ? {
        revalidate: _opts
      } : _opts || {});
      let populateCache = options.populateCache;
      const rollbackOnErrorOption = options.rollbackOnError;
      let optimisticData = options.optimisticData;
      const rollbackOnError = (error) => {
        return typeof rollbackOnErrorOption === "function" ? rollbackOnErrorOption(error) : rollbackOnErrorOption !== false;
      };
      const throwOnError = options.throwOnError;
      if (isFunction(_key)) {
        const keyFilter = _key;
        const matchedKeys = [];
        const it = cache2.keys();
        for (const key of it) {
          if (
            // Skip the special useSWRInfinite and useSWRSubscription keys.
            !/^\$(inf|sub)\$/.test(key) && keyFilter(cache2.get(key)._k)
          ) {
            matchedKeys.push(key);
          }
        }
        return Promise.all(matchedKeys.map(mutateByKey));
      }
      return mutateByKey(_key);
      async function mutateByKey(_k) {
        const [key] = serialize(_k);
        if (!key)
          return;
        const [get, set] = createCacheHelper(cache2, key);
        const [EVENT_REVALIDATORS, MUTATION, FETCH, PRELOAD] = SWRGlobalState.get(cache2);
        const startRevalidate = () => {
          const revalidators = EVENT_REVALIDATORS[key];
          const revalidate = isFunction(options.revalidate) ? options.revalidate(get().data, _k) : options.revalidate !== false;
          if (revalidate) {
            delete FETCH[key];
            delete PRELOAD[key];
            if (revalidators && revalidators[0]) {
              return revalidators[0](revalidateEvents__namespace.MUTATE_EVENT).then(() => get().data);
            }
          }
          return get().data;
        };
        if (args.length < 3) {
          return startRevalidate();
        }
        let data = _data;
        let error;
        const beforeMutationTs = getTimestamp();
        MUTATION[key] = [
          beforeMutationTs,
          0
        ];
        const hasOptimisticData = !isUndefined(optimisticData);
        const state = get();
        const displayedData = state.data;
        const currentData = state._c;
        const committedData = isUndefined(currentData) ? displayedData : currentData;
        if (hasOptimisticData) {
          optimisticData = isFunction(optimisticData) ? optimisticData(committedData, displayedData) : optimisticData;
          set({
            data: optimisticData,
            _c: committedData
          });
        }
        if (isFunction(data)) {
          try {
            data = data(committedData);
          } catch (err) {
            error = err;
          }
        }
        if (data && isPromiseLike(data)) {
          data = await data.catch((err) => {
            error = err;
          });
          if (beforeMutationTs !== MUTATION[key][0]) {
            if (error)
              throw error;
            return data;
          } else if (error && hasOptimisticData && rollbackOnError(error)) {
            populateCache = true;
            set({
              data: committedData,
              _c: UNDEFINED
            });
          }
        }
        if (populateCache) {
          if (!error) {
            if (isFunction(populateCache)) {
              const populateCachedData = populateCache(data, committedData);
              set({
                data: populateCachedData,
                error: UNDEFINED,
                _c: UNDEFINED
              });
            } else {
              set({
                data,
                error: UNDEFINED,
                _c: UNDEFINED
              });
            }
          }
        }
        MUTATION[key][1] = getTimestamp();
        Promise.resolve(startRevalidate()).then(() => {
          set({
            _c: UNDEFINED
          });
        });
        if (error) {
          if (throwOnError)
            throw error;
          return;
        }
        return data;
      }
    }
    var revalidateAllKeys = (revalidators, type) => {
      for (const key in revalidators) {
        if (revalidators[key][0])
          revalidators[key][0](type);
      }
    };
    var initCache = (provider, options) => {
      if (!SWRGlobalState.has(provider)) {
        const opts = mergeObjects(defaultConfigOptions, options);
        const EVENT_REVALIDATORS = /* @__PURE__ */ Object.create(null);
        const mutate2 = internalMutate.bind(UNDEFINED, provider);
        let unmount = noop;
        const subscriptions = /* @__PURE__ */ Object.create(null);
        const subscribe = (key, callback) => {
          const subs = subscriptions[key] || [];
          subscriptions[key] = subs;
          subs.push(callback);
          return () => subs.splice(subs.indexOf(callback), 1);
        };
        const setter = (key, value, prev) => {
          provider.set(key, value);
          const subs = subscriptions[key];
          if (subs) {
            for (const fn of subs) {
              fn(value, prev);
            }
          }
        };
        const initProvider = () => {
          if (!SWRGlobalState.has(provider)) {
            SWRGlobalState.set(provider, [
              EVENT_REVALIDATORS,
              /* @__PURE__ */ Object.create(null),
              /* @__PURE__ */ Object.create(null),
              /* @__PURE__ */ Object.create(null),
              mutate2,
              setter,
              subscribe
            ]);
            if (!IS_SERVER) {
              const releaseFocus = opts.initFocus(setTimeout.bind(UNDEFINED, revalidateAllKeys.bind(UNDEFINED, EVENT_REVALIDATORS, revalidateEvents__namespace.FOCUS_EVENT)));
              const releaseReconnect = opts.initReconnect(setTimeout.bind(UNDEFINED, revalidateAllKeys.bind(UNDEFINED, EVENT_REVALIDATORS, revalidateEvents__namespace.RECONNECT_EVENT)));
              unmount = () => {
                releaseFocus && releaseFocus();
                releaseReconnect && releaseReconnect();
                SWRGlobalState.delete(provider);
              };
            }
          }
        };
        initProvider();
        return [
          provider,
          mutate2,
          initProvider,
          unmount
        ];
      }
      return [
        provider,
        SWRGlobalState.get(provider)[4]
      ];
    };
    var onErrorRetry = (_, __, config, revalidate, opts) => {
      const maxRetryCount = config.errorRetryCount;
      const currentRetryCount = opts.retryCount;
      const timeout = ~~((Math.random() + 0.5) * (1 << (currentRetryCount < 8 ? currentRetryCount : 8))) * config.errorRetryInterval;
      if (!isUndefined(maxRetryCount) && currentRetryCount > maxRetryCount) {
        return;
      }
      setTimeout(revalidate, timeout, opts);
    };
    var compare = lite.dequal;
    var [cache, mutate] = initCache(/* @__PURE__ */ new Map());
    var defaultConfig = mergeObjects(
      {
        // events
        onLoadingSlow: noop,
        onSuccess: noop,
        onError: noop,
        onErrorRetry,
        onDiscarded: noop,
        // switches
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        revalidateIfStale: true,
        shouldRetryOnError: true,
        // timeouts
        errorRetryInterval: slowConnection ? 1e4 : 5e3,
        focusThrottleInterval: 5 * 1e3,
        dedupingInterval: 2 * 1e3,
        loadingTimeout: slowConnection ? 5e3 : 3e3,
        // providers
        compare,
        isPaused: () => false,
        cache,
        mutate,
        fallback: {}
      },
      // use web preset by default
      preset
    );
    var mergeConfigs = (a, b) => {
      const v = mergeObjects(a, b);
      if (b) {
        const { use: u1, fallback: f1 } = a;
        const { use: u2, fallback: f2 } = b;
        if (u1 && u2) {
          v.use = u1.concat(u2);
        }
        if (f1 && f2) {
          v.fallback = mergeObjects(f1, f2);
        }
      }
      return v;
    };
    var SWRConfigContext = React.createContext({});
    var SWRConfig = (props) => {
      const { value } = props;
      const parentConfig = React.useContext(SWRConfigContext);
      const isFunctionalConfig = isFunction(value);
      const config = React.useMemo(() => isFunctionalConfig ? value(parentConfig) : value, [
        isFunctionalConfig,
        parentConfig,
        value
      ]);
      const extendedConfig = React.useMemo(() => isFunctionalConfig ? config : mergeConfigs(parentConfig, config), [
        isFunctionalConfig,
        parentConfig,
        config
      ]);
      const provider = config && config.provider;
      const cacheContextRef = React.useRef(UNDEFINED);
      if (provider && !cacheContextRef.current) {
        cacheContextRef.current = initCache(provider(extendedConfig.cache || cache), config);
      }
      const cacheContext = cacheContextRef.current;
      if (cacheContext) {
        extendedConfig.cache = cacheContext[0];
        extendedConfig.mutate = cacheContext[1];
      }
      useIsomorphicLayoutEffect(() => {
        if (cacheContext) {
          cacheContext[2] && cacheContext[2]();
          return cacheContext[3];
        }
      }, []);
      return React.createElement(SWRConfigContext.Provider, mergeObjects(props, {
        value: extendedConfig
      }));
    };
    exports.IS_REACT_LEGACY = IS_REACT_LEGACY;
    exports.IS_SERVER = IS_SERVER;
    exports.OBJECT = OBJECT;
    exports.SWRConfig = SWRConfig;
    exports.SWRConfigContext = SWRConfigContext;
    exports.SWRGlobalState = SWRGlobalState;
    exports.UNDEFINED = UNDEFINED;
    exports.cache = cache;
    exports.compare = compare;
    exports.createCacheHelper = createCacheHelper;
    exports.defaultConfig = defaultConfig;
    exports.defaultConfigOptions = defaultConfigOptions;
    exports.getTimestamp = getTimestamp;
    exports.hasRequestAnimationFrame = hasRequestAnimationFrame;
    exports.initCache = initCache;
    exports.internalMutate = internalMutate;
    exports.isDocumentDefined = isDocumentDefined;
    exports.isFunction = isFunction;
    exports.isLegacyDeno = isLegacyDeno;
    exports.isPromiseLike = isPromiseLike;
    exports.isUndefined = isUndefined;
    exports.isWindowDefined = isWindowDefined;
    exports.mergeConfigs = mergeConfigs;
    exports.mergeObjects = mergeObjects;
    exports.mutate = mutate;
    exports.noop = noop;
    exports.preset = preset;
    exports.rAF = rAF;
    exports.serialize = serialize;
    exports.slowConnection = slowConnection;
    exports.stableHash = stableHash;
    exports.useIsomorphicLayoutEffect = useIsomorphicLayoutEffect;
  }
});

// ../node_modules/swr/dist/_internal/constants.js
var require_constants = __commonJS({
  "../node_modules/swr/dist/_internal/constants.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var INFINITE_PREFIX = "$inf$";
    exports.INFINITE_PREFIX = INFINITE_PREFIX;
  }
});

// ../node_modules/swr/dist/_internal/types.js
var require_types = __commonJS({
  "../node_modules/swr/dist/_internal/types.js"() {
  }
});

// ../node_modules/swr/dist/_internal/index.js
var require_internal = __commonJS({
  "../node_modules/swr/dist/_internal/index.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var configContextClient = require_config_context_client_BXAm5QZy();
    var revalidateEvents = require_events();
    var constants_js = require_constants();
    var React = require_react();
    var types_js = require_types();
    function _interopDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    function _interopNamespace(e) {
      if (e && e.__esModule)
        return e;
      var n = /* @__PURE__ */ Object.create(null);
      if (e) {
        Object.keys(e).forEach(function(k) {
          if (k !== "default") {
            var d = Object.getOwnPropertyDescriptor(e, k);
            Object.defineProperty(n, k, d.get ? d : {
              enumerable: true,
              get: function() {
                return e[k];
              }
            });
          }
        });
      }
      n.default = e;
      return n;
    }
    var revalidateEvents__namespace = /* @__PURE__ */ _interopNamespace(revalidateEvents);
    var React__default = /* @__PURE__ */ _interopDefault(React);
    var enableDevtools = configContextClient.isWindowDefined && window.__SWR_DEVTOOLS_USE__;
    var use = enableDevtools ? window.__SWR_DEVTOOLS_USE__ : [];
    var setupDevTools = () => {
      if (enableDevtools) {
        window.__SWR_DEVTOOLS_REACT__ = React__default.default;
      }
    };
    var normalize = (args) => {
      return configContextClient.isFunction(args[1]) ? [
        args[0],
        args[1],
        args[2] || {}
      ] : [
        args[0],
        null,
        (args[1] === null ? args[2] : args[1]) || {}
      ];
    };
    var useSWRConfig = () => {
      return configContextClient.mergeObjects(configContextClient.defaultConfig, React.useContext(configContextClient.SWRConfigContext));
    };
    var preload = (key_, fetcher) => {
      const [key, fnArg] = configContextClient.serialize(key_);
      const [, , , PRELOAD] = configContextClient.SWRGlobalState.get(configContextClient.cache);
      if (PRELOAD[key])
        return PRELOAD[key];
      const req = fetcher(fnArg);
      PRELOAD[key] = req;
      return req;
    };
    var middleware = (useSWRNext) => (key_, fetcher_, config) => {
      const fetcher = fetcher_ && ((...args) => {
        const [key] = configContextClient.serialize(key_);
        const [, , , PRELOAD] = configContextClient.SWRGlobalState.get(configContextClient.cache);
        if (key.startsWith(constants_js.INFINITE_PREFIX)) {
          return fetcher_(...args);
        }
        const req = PRELOAD[key];
        if (configContextClient.isUndefined(req))
          return fetcher_(...args);
        delete PRELOAD[key];
        return req;
      });
      return useSWRNext(key_, fetcher, config);
    };
    var BUILT_IN_MIDDLEWARE = use.concat(middleware);
    var withArgs = (hook) => {
      return function useSWRArgs(...args) {
        const fallbackConfig = useSWRConfig();
        const [key, fn, _config] = normalize(args);
        const config = configContextClient.mergeConfigs(fallbackConfig, _config);
        let next = hook;
        const { use: use2 } = config;
        const middleware2 = (use2 || []).concat(BUILT_IN_MIDDLEWARE);
        for (let i = middleware2.length; i--; ) {
          next = middleware2[i](next);
        }
        return next(key, fn || config.fetcher || null, config);
      };
    };
    var subscribeCallback = (key, callbacks, callback) => {
      const keyedRevalidators = callbacks[key] || (callbacks[key] = []);
      keyedRevalidators.push(callback);
      return () => {
        const index = keyedRevalidators.indexOf(callback);
        if (index >= 0) {
          keyedRevalidators[index] = keyedRevalidators[keyedRevalidators.length - 1];
          keyedRevalidators.pop();
        }
      };
    };
    var withMiddleware = (useSWR, middleware2) => {
      return (...args) => {
        const [key, fn, config] = normalize(args);
        const uses = (config.use || []).concat(middleware2);
        return useSWR(key, fn, {
          ...config,
          use: uses
        });
      };
    };
    setupDevTools();
    exports.IS_REACT_LEGACY = configContextClient.IS_REACT_LEGACY;
    exports.IS_SERVER = configContextClient.IS_SERVER;
    exports.OBJECT = configContextClient.OBJECT;
    exports.SWRConfig = configContextClient.SWRConfig;
    exports.SWRGlobalState = configContextClient.SWRGlobalState;
    exports.UNDEFINED = configContextClient.UNDEFINED;
    exports.cache = configContextClient.cache;
    exports.compare = configContextClient.compare;
    exports.createCacheHelper = configContextClient.createCacheHelper;
    exports.defaultConfig = configContextClient.defaultConfig;
    exports.defaultConfigOptions = configContextClient.defaultConfigOptions;
    exports.getTimestamp = configContextClient.getTimestamp;
    exports.hasRequestAnimationFrame = configContextClient.hasRequestAnimationFrame;
    exports.initCache = configContextClient.initCache;
    exports.internalMutate = configContextClient.internalMutate;
    exports.isDocumentDefined = configContextClient.isDocumentDefined;
    exports.isFunction = configContextClient.isFunction;
    exports.isLegacyDeno = configContextClient.isLegacyDeno;
    exports.isPromiseLike = configContextClient.isPromiseLike;
    exports.isUndefined = configContextClient.isUndefined;
    exports.isWindowDefined = configContextClient.isWindowDefined;
    exports.mergeConfigs = configContextClient.mergeConfigs;
    exports.mergeObjects = configContextClient.mergeObjects;
    exports.mutate = configContextClient.mutate;
    exports.noop = configContextClient.noop;
    exports.preset = configContextClient.preset;
    exports.rAF = configContextClient.rAF;
    exports.serialize = configContextClient.serialize;
    exports.slowConnection = configContextClient.slowConnection;
    exports.stableHash = configContextClient.stableHash;
    exports.useIsomorphicLayoutEffect = configContextClient.useIsomorphicLayoutEffect;
    exports.revalidateEvents = revalidateEvents__namespace;
    Object.defineProperty(exports, "INFINITE_PREFIX", {
      enumerable: true,
      get: function() {
        return constants_js.INFINITE_PREFIX;
      }
    });
    exports.normalize = normalize;
    exports.preload = preload;
    exports.subscribeCallback = subscribeCallback;
    exports.useSWRConfig = useSWRConfig;
    exports.withArgs = withArgs;
    exports.withMiddleware = withMiddleware;
    Object.keys(types_js).forEach(function(k) {
      if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k))
        Object.defineProperty(exports, k, {
          enumerable: true,
          get: function() {
            return types_js[k];
          }
        });
    });
  }
});

// ../node_modules/swr/dist/index/index.js
var require_index = __commonJS({
  "../node_modules/swr/dist/index/index.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var React = require_react();
    var index_js$1 = require_shim();
    var index_js = require_internal();
    function _interopDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var React__default = /* @__PURE__ */ _interopDefault(React);
    var noop = () => {
    };
    var UNDEFINED = (
      /*#__NOINLINE__*/
      noop()
    );
    var OBJECT = Object;
    var isUndefined = (v) => v === UNDEFINED;
    var isFunction = (v) => typeof v == "function";
    var table = /* @__PURE__ */ new WeakMap();
    var isObjectType = (value, type) => OBJECT.prototype.toString.call(value) === `[object ${type}]`;
    var counter = 0;
    var stableHash = (arg) => {
      const type = typeof arg;
      const isDate = isObjectType(arg, "Date");
      const isRegex = isObjectType(arg, "RegExp");
      const isPlainObject = isObjectType(arg, "Object");
      let result;
      let index;
      if (OBJECT(arg) === arg && !isDate && !isRegex) {
        result = table.get(arg);
        if (result)
          return result;
        result = ++counter + "~";
        table.set(arg, result);
        if (Array.isArray(arg)) {
          result = "@";
          for (index = 0; index < arg.length; index++) {
            result += stableHash(arg[index]) + ",";
          }
          table.set(arg, result);
        }
        if (isPlainObject) {
          result = "#";
          const keys = OBJECT.keys(arg).sort();
          while (!isUndefined(index = keys.pop())) {
            if (!isUndefined(arg[index])) {
              result += index + ":" + stableHash(arg[index]) + ",";
            }
          }
          table.set(arg, result);
        }
      } else {
        result = isDate ? arg.toJSON() : type == "symbol" ? arg.toString() : type == "string" ? JSON.stringify(arg) : "" + arg;
      }
      return result;
    };
    var serialize = (key) => {
      if (isFunction(key)) {
        try {
          key = key();
        } catch (err) {
          key = "";
        }
      }
      const args = key;
      key = typeof key == "string" ? key : (Array.isArray(key) ? key.length : key) ? stableHash(key) : "";
      return [
        key,
        args
      ];
    };
    var unstable_serialize = (key) => serialize(key)[0];
    var use = React__default.default.use || // This extra generic is to avoid TypeScript mixing up the generic and JSX sytax
    // and emitting an error.
    // We assume that this is only for the `use(thenable)` case, not `use(context)`.
    // https://github.com/facebook/react/blob/aed00dacfb79d17c53218404c52b1c7aa59c4a89/packages/react-server/src/ReactFizzThenable.js#L45
    ((thenable) => {
      switch (thenable.status) {
        case "pending":
          throw thenable;
        case "fulfilled":
          return thenable.value;
        case "rejected":
          throw thenable.reason;
        default:
          thenable.status = "pending";
          thenable.then((v) => {
            thenable.status = "fulfilled";
            thenable.value = v;
          }, (e) => {
            thenable.status = "rejected";
            thenable.reason = e;
          });
          throw thenable;
      }
    });
    var WITH_DEDUPE = {
      dedupe: true
    };
    var useSWRHandler = (_key, fetcher, config) => {
      const { cache, compare, suspense, fallbackData, revalidateOnMount, revalidateIfStale, refreshInterval, refreshWhenHidden, refreshWhenOffline, keepPreviousData } = config;
      const [EVENT_REVALIDATORS, MUTATION, FETCH, PRELOAD] = index_js.SWRGlobalState.get(cache);
      const [key, fnArg] = index_js.serialize(_key);
      const initialMountedRef = React.useRef(false);
      const unmountedRef = React.useRef(false);
      const keyRef = React.useRef(key);
      const fetcherRef = React.useRef(fetcher);
      const configRef = React.useRef(config);
      const getConfig = () => configRef.current;
      const isActive = () => getConfig().isVisible() && getConfig().isOnline();
      const [getCache, setCache, subscribeCache, getInitialCache] = index_js.createCacheHelper(cache, key);
      const stateDependencies = React.useRef({}).current;
      const fallback = index_js.isUndefined(fallbackData) ? index_js.isUndefined(config.fallback) ? index_js.UNDEFINED : config.fallback[key] : fallbackData;
      const isEqual = (prev, current) => {
        for (const _ in stateDependencies) {
          const t = _;
          if (t === "data") {
            if (!compare(prev[t], current[t])) {
              if (!index_js.isUndefined(prev[t])) {
                return false;
              }
              if (!compare(returnedData, current[t])) {
                return false;
              }
            }
          } else {
            if (current[t] !== prev[t]) {
              return false;
            }
          }
        }
        return true;
      };
      const getSnapshot = React.useMemo(() => {
        const shouldStartRequest = (() => {
          if (!key)
            return false;
          if (!fetcher)
            return false;
          if (!index_js.isUndefined(revalidateOnMount))
            return revalidateOnMount;
          if (getConfig().isPaused())
            return false;
          if (suspense)
            return false;
          return revalidateIfStale !== false;
        })();
        const getSelectedCache = (state) => {
          const snapshot = index_js.mergeObjects(state);
          delete snapshot._k;
          if (!shouldStartRequest) {
            return snapshot;
          }
          return {
            isValidating: true,
            isLoading: true,
            ...snapshot
          };
        };
        const cachedData2 = getCache();
        const initialData = getInitialCache();
        const clientSnapshot = getSelectedCache(cachedData2);
        const serverSnapshot = cachedData2 === initialData ? clientSnapshot : getSelectedCache(initialData);
        let memorizedSnapshot = clientSnapshot;
        return [
          () => {
            const newSnapshot = getSelectedCache(getCache());
            const compareResult = isEqual(newSnapshot, memorizedSnapshot);
            if (compareResult) {
              memorizedSnapshot.data = newSnapshot.data;
              memorizedSnapshot.isLoading = newSnapshot.isLoading;
              memorizedSnapshot.isValidating = newSnapshot.isValidating;
              memorizedSnapshot.error = newSnapshot.error;
              return memorizedSnapshot;
            } else {
              memorizedSnapshot = newSnapshot;
              return newSnapshot;
            }
          },
          () => serverSnapshot
        ];
      }, [
        cache,
        key
      ]);
      const cached = index_js$1.useSyncExternalStore(React.useCallback(
        (callback) => subscribeCache(key, (current, prev) => {
          if (!isEqual(prev, current))
            callback();
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
          cache,
          key
        ]
      ), getSnapshot[0], getSnapshot[1]);
      const isInitialMount = !initialMountedRef.current;
      const hasRevalidator = EVENT_REVALIDATORS[key] && EVENT_REVALIDATORS[key].length > 0;
      const cachedData = cached.data;
      const data = index_js.isUndefined(cachedData) ? fallback && index_js.isPromiseLike(fallback) ? use(fallback) : fallback : cachedData;
      const error = cached.error;
      const laggyDataRef = React.useRef(data);
      const returnedData = keepPreviousData ? index_js.isUndefined(cachedData) ? index_js.isUndefined(laggyDataRef.current) ? data : laggyDataRef.current : cachedData : data;
      const shouldDoInitialRevalidation = (() => {
        if (hasRevalidator && !index_js.isUndefined(error))
          return false;
        if (isInitialMount && !index_js.isUndefined(revalidateOnMount))
          return revalidateOnMount;
        if (getConfig().isPaused())
          return false;
        if (suspense)
          return index_js.isUndefined(data) ? false : revalidateIfStale;
        return index_js.isUndefined(data) || revalidateIfStale;
      })();
      const defaultValidatingState = !!(key && fetcher && isInitialMount && shouldDoInitialRevalidation);
      const isValidating = index_js.isUndefined(cached.isValidating) ? defaultValidatingState : cached.isValidating;
      const isLoading = index_js.isUndefined(cached.isLoading) ? defaultValidatingState : cached.isLoading;
      const revalidate = React.useCallback(
        async (revalidateOpts) => {
          const currentFetcher = fetcherRef.current;
          if (!key || !currentFetcher || unmountedRef.current || getConfig().isPaused()) {
            return false;
          }
          let newData;
          let startAt;
          let loading = true;
          const opts = revalidateOpts || {};
          const shouldStartNewRequest = !FETCH[key] || !opts.dedupe;
          const callbackSafeguard = () => {
            if (index_js.IS_REACT_LEGACY) {
              return !unmountedRef.current && key === keyRef.current && initialMountedRef.current;
            }
            return key === keyRef.current;
          };
          const finalState = {
            isValidating: false,
            isLoading: false
          };
          const finishRequestAndUpdateState = () => {
            setCache(finalState);
          };
          const cleanupState = () => {
            const requestInfo = FETCH[key];
            if (requestInfo && requestInfo[1] === startAt) {
              delete FETCH[key];
            }
          };
          const initialState = {
            isValidating: true
          };
          if (index_js.isUndefined(getCache().data)) {
            initialState.isLoading = true;
          }
          try {
            if (shouldStartNewRequest) {
              setCache(initialState);
              if (config.loadingTimeout && index_js.isUndefined(getCache().data)) {
                setTimeout(() => {
                  if (loading && callbackSafeguard()) {
                    getConfig().onLoadingSlow(key, config);
                  }
                }, config.loadingTimeout);
              }
              FETCH[key] = [
                currentFetcher(fnArg),
                index_js.getTimestamp()
              ];
            }
            ;
            [newData, startAt] = FETCH[key];
            newData = await newData;
            if (shouldStartNewRequest) {
              setTimeout(cleanupState, config.dedupingInterval);
            }
            if (!FETCH[key] || FETCH[key][1] !== startAt) {
              if (shouldStartNewRequest) {
                if (callbackSafeguard()) {
                  getConfig().onDiscarded(key);
                }
              }
              return false;
            }
            finalState.error = index_js.UNDEFINED;
            const mutationInfo = MUTATION[key];
            if (!index_js.isUndefined(mutationInfo) && // case 1
            (startAt <= mutationInfo[0] || // case 2
            startAt <= mutationInfo[1] || // case 3
            mutationInfo[1] === 0)) {
              finishRequestAndUpdateState();
              if (shouldStartNewRequest) {
                if (callbackSafeguard()) {
                  getConfig().onDiscarded(key);
                }
              }
              return false;
            }
            const cacheData = getCache().data;
            finalState.data = compare(cacheData, newData) ? cacheData : newData;
            if (shouldStartNewRequest) {
              if (callbackSafeguard()) {
                getConfig().onSuccess(newData, key, config);
              }
            }
          } catch (err) {
            cleanupState();
            const currentConfig = getConfig();
            const { shouldRetryOnError } = currentConfig;
            if (!currentConfig.isPaused()) {
              finalState.error = err;
              if (shouldStartNewRequest && callbackSafeguard()) {
                currentConfig.onError(err, key, currentConfig);
                if (shouldRetryOnError === true || index_js.isFunction(shouldRetryOnError) && shouldRetryOnError(err)) {
                  if (!getConfig().revalidateOnFocus || !getConfig().revalidateOnReconnect || isActive()) {
                    currentConfig.onErrorRetry(err, key, currentConfig, (_opts) => {
                      const revalidators = EVENT_REVALIDATORS[key];
                      if (revalidators && revalidators[0]) {
                        revalidators[0](index_js.revalidateEvents.ERROR_REVALIDATE_EVENT, _opts);
                      }
                    }, {
                      retryCount: (opts.retryCount || 0) + 1,
                      dedupe: true
                    });
                  }
                }
              }
            }
          }
          loading = false;
          finishRequestAndUpdateState();
          return true;
        },
        // `setState` is immutable, and `eventsCallback`, `fnArg`, and
        // `keyValidating` are depending on `key`, so we can exclude them from
        // the deps array.
        //
        // FIXME:
        // `fn` and `config` might be changed during the lifecycle,
        // but they might be changed every render like this.
        // `useSWR('key', () => fetch('/api/'), { suspense: true })`
        // So we omit the values from the deps array
        // even though it might cause unexpected behaviors.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
          key,
          cache
        ]
      );
      const boundMutate = React.useCallback(
        // Use callback to make sure `keyRef.current` returns latest result every time
        (...args) => {
          return index_js.internalMutate(cache, keyRef.current, ...args);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
      );
      index_js.useIsomorphicLayoutEffect(() => {
        fetcherRef.current = fetcher;
        configRef.current = config;
        if (!index_js.isUndefined(cachedData)) {
          laggyDataRef.current = cachedData;
        }
      });
      index_js.useIsomorphicLayoutEffect(() => {
        if (!key)
          return;
        const softRevalidate = revalidate.bind(index_js.UNDEFINED, WITH_DEDUPE);
        let nextFocusRevalidatedAt = 0;
        if (getConfig().revalidateOnFocus) {
          const initNow = Date.now();
          nextFocusRevalidatedAt = initNow + getConfig().focusThrottleInterval;
        }
        const onRevalidate = (type, opts = {}) => {
          if (type == index_js.revalidateEvents.FOCUS_EVENT) {
            const now = Date.now();
            if (getConfig().revalidateOnFocus && now > nextFocusRevalidatedAt && isActive()) {
              nextFocusRevalidatedAt = now + getConfig().focusThrottleInterval;
              softRevalidate();
            }
          } else if (type == index_js.revalidateEvents.RECONNECT_EVENT) {
            if (getConfig().revalidateOnReconnect && isActive()) {
              softRevalidate();
            }
          } else if (type == index_js.revalidateEvents.MUTATE_EVENT) {
            return revalidate();
          } else if (type == index_js.revalidateEvents.ERROR_REVALIDATE_EVENT) {
            return revalidate(opts);
          }
          return;
        };
        const unsubEvents = index_js.subscribeCallback(key, EVENT_REVALIDATORS, onRevalidate);
        unmountedRef.current = false;
        keyRef.current = key;
        initialMountedRef.current = true;
        setCache({
          _k: fnArg
        });
        if (shouldDoInitialRevalidation) {
          if (index_js.isUndefined(data) || index_js.IS_SERVER) {
            softRevalidate();
          } else {
            index_js.rAF(softRevalidate);
          }
        }
        return () => {
          unmountedRef.current = true;
          unsubEvents();
        };
      }, [
        key
      ]);
      index_js.useIsomorphicLayoutEffect(() => {
        let timer;
        function next() {
          const interval = index_js.isFunction(refreshInterval) ? refreshInterval(getCache().data) : refreshInterval;
          if (interval && timer !== -1) {
            timer = setTimeout(execute, interval);
          }
        }
        function execute() {
          if (!getCache().error && (refreshWhenHidden || getConfig().isVisible()) && (refreshWhenOffline || getConfig().isOnline())) {
            revalidate(WITH_DEDUPE).then(next);
          } else {
            next();
          }
        }
        next();
        return () => {
          if (timer) {
            clearTimeout(timer);
            timer = -1;
          }
        };
      }, [
        refreshInterval,
        refreshWhenHidden,
        refreshWhenOffline,
        key
      ]);
      React.useDebugValue(returnedData);
      if (suspense && index_js.isUndefined(data) && key) {
        if (!index_js.IS_REACT_LEGACY && index_js.IS_SERVER) {
          throw new Error("Fallback data is required when using Suspense in SSR.");
        }
        fetcherRef.current = fetcher;
        configRef.current = config;
        unmountedRef.current = false;
        const req = PRELOAD[key];
        if (!index_js.isUndefined(req)) {
          const promise = boundMutate(req);
          use(promise);
        }
        if (index_js.isUndefined(error)) {
          const promise = revalidate(WITH_DEDUPE);
          if (!index_js.isUndefined(returnedData)) {
            promise.status = "fulfilled";
            promise.value = true;
          }
          use(promise);
        } else {
          throw error;
        }
      }
      const swrResponse = {
        mutate: boundMutate,
        get data() {
          stateDependencies.data = true;
          return returnedData;
        },
        get error() {
          stateDependencies.error = true;
          return error;
        },
        get isValidating() {
          stateDependencies.isValidating = true;
          return isValidating;
        },
        get isLoading() {
          stateDependencies.isLoading = true;
          return isLoading;
        }
      };
      return swrResponse;
    };
    var SWRConfig = index_js.OBJECT.defineProperty(index_js.SWRConfig, "defaultValue", {
      value: index_js.defaultConfig
    });
    var useSWR = index_js.withArgs(useSWRHandler);
    Object.defineProperty(exports, "mutate", {
      enumerable: true,
      get: function() {
        return index_js.mutate;
      }
    });
    Object.defineProperty(exports, "preload", {
      enumerable: true,
      get: function() {
        return index_js.preload;
      }
    });
    Object.defineProperty(exports, "useSWRConfig", {
      enumerable: true,
      get: function() {
        return index_js.useSWRConfig;
      }
    });
    exports.SWRConfig = SWRConfig;
    exports.default = useSWR;
    exports.unstable_serialize = unstable_serialize;
  }
});

// ../node_modules/swr/dist/infinite/index.js
var require_infinite = __commonJS({
  "../node_modules/swr/dist/infinite/index.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var react = require_react();
    var useSWR = require_index();
    var index_js = require_internal();
    var index_js$1 = require_shim();
    var constants_js = require_constants();
    function _interopDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
    var useSWR__default = /* @__PURE__ */ _interopDefault(useSWR);
    var noop = () => {
    };
    var UNDEFINED = (
      /*#__NOINLINE__*/
      noop()
    );
    var OBJECT = Object;
    var isUndefined = (v) => v === UNDEFINED;
    var isFunction = (v) => typeof v == "function";
    var table = /* @__PURE__ */ new WeakMap();
    var isObjectType = (value, type) => OBJECT.prototype.toString.call(value) === `[object ${type}]`;
    var counter = 0;
    var stableHash = (arg) => {
      const type = typeof arg;
      const isDate = isObjectType(arg, "Date");
      const isRegex = isObjectType(arg, "RegExp");
      const isPlainObject = isObjectType(arg, "Object");
      let result;
      let index;
      if (OBJECT(arg) === arg && !isDate && !isRegex) {
        result = table.get(arg);
        if (result)
          return result;
        result = ++counter + "~";
        table.set(arg, result);
        if (Array.isArray(arg)) {
          result = "@";
          for (index = 0; index < arg.length; index++) {
            result += stableHash(arg[index]) + ",";
          }
          table.set(arg, result);
        }
        if (isPlainObject) {
          result = "#";
          const keys = OBJECT.keys(arg).sort();
          while (!isUndefined(index = keys.pop())) {
            if (!isUndefined(arg[index])) {
              result += index + ":" + stableHash(arg[index]) + ",";
            }
          }
          table.set(arg, result);
        }
      } else {
        result = isDate ? arg.toJSON() : type == "symbol" ? arg.toString() : type == "string" ? JSON.stringify(arg) : "" + arg;
      }
      return result;
    };
    var serialize = (key) => {
      if (isFunction(key)) {
        try {
          key = key();
        } catch (err) {
          key = "";
        }
      }
      const args = key;
      key = typeof key == "string" ? key : (Array.isArray(key) ? key.length : key) ? stableHash(key) : "";
      return [
        key,
        args
      ];
    };
    var getFirstPageKey = (getKey) => {
      return serialize(getKey ? getKey(0, null) : null)[0];
    };
    var unstable_serialize = (getKey) => {
      return constants_js.INFINITE_PREFIX + getFirstPageKey(getKey);
    };
    var EMPTY_PROMISE = Promise.resolve();
    var infinite = (useSWRNext) => (getKey, fn, config) => {
      const didMountRef = react.useRef(false);
      const { cache, initialSize = 1, revalidateAll = false, persistSize = false, revalidateFirstPage = true, revalidateOnMount = false, parallel = false } = config;
      const [, , , PRELOAD] = index_js.SWRGlobalState.get(index_js.cache);
      let infiniteKey;
      try {
        infiniteKey = getFirstPageKey(getKey);
        if (infiniteKey)
          infiniteKey = index_js.INFINITE_PREFIX + infiniteKey;
      } catch (err) {
      }
      const [get, set, subscribeCache] = index_js.createCacheHelper(cache, infiniteKey);
      const getSnapshot = react.useCallback(() => {
        const size = index_js.isUndefined(get()._l) ? initialSize : get()._l;
        return size;
      }, [
        cache,
        infiniteKey,
        initialSize
      ]);
      index_js$1.useSyncExternalStore(react.useCallback(
        (callback) => {
          if (infiniteKey)
            return subscribeCache(infiniteKey, () => {
              callback();
            });
          return () => {
          };
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
          cache,
          infiniteKey
        ]
      ), getSnapshot, getSnapshot);
      const resolvePageSize = react.useCallback(() => {
        const cachedPageSize = get()._l;
        return index_js.isUndefined(cachedPageSize) ? initialSize : cachedPageSize;
      }, [
        infiniteKey,
        initialSize
      ]);
      const lastPageSizeRef = react.useRef(resolvePageSize());
      index_js.useIsomorphicLayoutEffect(() => {
        if (!didMountRef.current) {
          didMountRef.current = true;
          return;
        }
        if (infiniteKey) {
          set({
            _l: persistSize ? lastPageSizeRef.current : resolvePageSize()
          });
        }
      }, [
        infiniteKey,
        cache
      ]);
      const shouldRevalidateOnMount = revalidateOnMount && !didMountRef.current;
      const swr = useSWRNext(infiniteKey, async (key) => {
        const forceRevalidateAll = get()._i;
        const shouldRevalidatePage = get()._r;
        set({
          _r: index_js.UNDEFINED
        });
        const data = [];
        const pageSize = resolvePageSize();
        const [getCache] = index_js.createCacheHelper(cache, key);
        const cacheData = getCache().data;
        const revalidators = [];
        let previousPageData = null;
        for (let i = 0; i < pageSize; ++i) {
          const [pageKey, pageArg] = index_js.serialize(getKey(i, parallel ? null : previousPageData));
          if (!pageKey) {
            break;
          }
          const [getSWRCache, setSWRCache] = index_js.createCacheHelper(cache, pageKey);
          let pageData = getSWRCache().data;
          const shouldFetchPage = revalidateAll || forceRevalidateAll || index_js.isUndefined(pageData) || revalidateFirstPage && !i && !index_js.isUndefined(cacheData) || shouldRevalidateOnMount || cacheData && !index_js.isUndefined(cacheData[i]) && !config.compare(cacheData[i], pageData);
          if (fn && (typeof shouldRevalidatePage === "function" ? shouldRevalidatePage(pageData, pageArg) : shouldFetchPage)) {
            const revalidate = async () => {
              const hasPreloadedRequest = pageKey in PRELOAD;
              if (!hasPreloadedRequest) {
                pageData = await fn(pageArg);
              } else {
                const req = PRELOAD[pageKey];
                delete PRELOAD[pageKey];
                pageData = await req;
              }
              setSWRCache({
                data: pageData,
                _k: pageArg
              });
              data[i] = pageData;
            };
            if (parallel) {
              revalidators.push(revalidate);
            } else {
              await revalidate();
            }
          } else {
            data[i] = pageData;
          }
          if (!parallel) {
            previousPageData = pageData;
          }
        }
        if (parallel) {
          await Promise.all(revalidators.map((r) => r()));
        }
        set({
          _i: index_js.UNDEFINED
        });
        return data;
      }, config);
      const mutate = react.useCallback(
        // eslint-disable-next-line func-names
        function(data, opts) {
          const options = typeof opts === "boolean" ? {
            revalidate: opts
          } : opts || {};
          const shouldRevalidate = options.revalidate !== false;
          if (!infiniteKey)
            return EMPTY_PROMISE;
          if (shouldRevalidate) {
            if (!index_js.isUndefined(data)) {
              set({
                _i: false,
                _r: options.revalidate
              });
            } else {
              set({
                _i: true,
                _r: options.revalidate
              });
            }
          }
          return arguments.length ? swr.mutate(data, {
            ...options,
            revalidate: shouldRevalidate
          }) : swr.mutate();
        },
        // swr.mutate is always the same reference
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
          infiniteKey,
          cache
        ]
      );
      const setSize = react.useCallback(
        (arg) => {
          if (!infiniteKey)
            return EMPTY_PROMISE;
          const [, changeSize] = index_js.createCacheHelper(cache, infiniteKey);
          let size;
          if (index_js.isFunction(arg)) {
            size = arg(resolvePageSize());
          } else if (typeof arg == "number") {
            size = arg;
          }
          if (typeof size != "number")
            return EMPTY_PROMISE;
          changeSize({
            _l: size
          });
          lastPageSizeRef.current = size;
          const data = [];
          const [getInfiniteCache] = index_js.createCacheHelper(cache, infiniteKey);
          let previousPageData = null;
          for (let i = 0; i < size; ++i) {
            const [pageKey] = index_js.serialize(getKey(i, previousPageData));
            const [getCache] = index_js.createCacheHelper(cache, pageKey);
            const pageData = pageKey ? getCache().data : index_js.UNDEFINED;
            if (index_js.isUndefined(pageData)) {
              return mutate(getInfiniteCache().data);
            }
            data.push(pageData);
            previousPageData = pageData;
          }
          return mutate(data);
        },
        // exclude getKey from the dependencies, which isn't allowed to change during the lifecycle
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
          infiniteKey,
          cache,
          mutate,
          resolvePageSize
        ]
      );
      return {
        size: resolvePageSize(),
        setSize,
        mutate,
        get data() {
          return swr.data;
        },
        get error() {
          return swr.error;
        },
        get isValidating() {
          return swr.isValidating;
        },
        get isLoading() {
          return swr.isLoading;
        }
      };
    };
    var useSWRInfinite = index_js.withMiddleware(useSWR__default.default, infinite);
    exports.default = useSWRInfinite;
    exports.infinite = infinite;
    exports.unstable_serialize = unstable_serialize;
  }
});

// ../node_modules/dequal/dist/index.js
var require_dist = __commonJS({
  "../node_modules/dequal/dist/index.js"(exports) {
    var has = Object.prototype.hasOwnProperty;
    function find(iter, tar, key) {
      for (key of iter.keys()) {
        if (dequal(key, tar))
          return key;
      }
    }
    function dequal(foo, bar) {
      var ctor, len, tmp;
      if (foo === bar)
        return true;
      if (foo && bar && (ctor = foo.constructor) === bar.constructor) {
        if (ctor === Date)
          return foo.getTime() === bar.getTime();
        if (ctor === RegExp)
          return foo.toString() === bar.toString();
        if (ctor === Array) {
          if ((len = foo.length) === bar.length) {
            while (len-- && dequal(foo[len], bar[len]))
              ;
          }
          return len === -1;
        }
        if (ctor === Set) {
          if (foo.size !== bar.size) {
            return false;
          }
          for (len of foo) {
            tmp = len;
            if (tmp && typeof tmp === "object") {
              tmp = find(bar, tmp);
              if (!tmp)
                return false;
            }
            if (!bar.has(tmp))
              return false;
          }
          return true;
        }
        if (ctor === Map) {
          if (foo.size !== bar.size) {
            return false;
          }
          for (len of foo) {
            tmp = len[0];
            if (tmp && typeof tmp === "object") {
              tmp = find(bar, tmp);
              if (!tmp)
                return false;
            }
            if (!dequal(len[1], bar.get(tmp))) {
              return false;
            }
          }
          return true;
        }
        if (ctor === ArrayBuffer) {
          foo = new Uint8Array(foo);
          bar = new Uint8Array(bar);
        } else if (ctor === DataView) {
          if ((len = foo.byteLength) === bar.byteLength) {
            while (len-- && foo.getInt8(len) === bar.getInt8(len))
              ;
          }
          return len === -1;
        }
        if (ArrayBuffer.isView(foo)) {
          if ((len = foo.byteLength) === bar.byteLength) {
            while (len-- && foo[len] === bar[len])
              ;
          }
          return len === -1;
        }
        if (!ctor || typeof foo === "object") {
          len = 0;
          for (ctor in foo) {
            if (has.call(foo, ctor) && ++len && !has.call(bar, ctor))
              return false;
            if (!(ctor in bar) || !dequal(foo[ctor], bar[ctor]))
              return false;
          }
          return Object.keys(bar).length === len;
        }
      }
      return foo !== foo && bar !== bar;
    }
    exports.dequal = dequal;
  }
});

// ../node_modules/@clerk/shared/dist/react/index.js
var require_react2 = __commonJS({
  "../node_modules/@clerk/shared/dist/react/index.js"(exports, module) {
    "use strict";
    var __create = Object.create;
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __getProtoOf = Object.getPrototypeOf;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
    var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
      // If the importer is in node compatibility mode or this is not an ESM
      // file that has been converted to a CommonJS file using a Babel-
      // compatible transform (i.e. "__esModule" has not been set), then set
      // "default" to the CommonJS "module.exports" for node compatibility.
      isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
      mod
    ));
    var __toCommonJS2 = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
    var react_exports = {};
    __export(react_exports, {
      ClerkInstanceContext: () => ClerkInstanceContext,
      ClientContext: () => ClientContext,
      OptionsContext: () => OptionsContext,
      OrganizationProvider: () => OrganizationProvider,
      SessionContext: () => SessionContext,
      UserContext: () => UserContext,
      assertContextExists: () => assertContextExists,
      createContextAndHook: () => createContextAndHook,
      isDeeplyEqual: () => isDeeplyEqual,
      useAssertWrappedByClerkProvider: () => useAssertWrappedByClerkProvider,
      useClerk: () => useClerk2,
      useClerkInstanceContext: () => useClerkInstanceContext,
      useClientContext: () => useClientContext,
      useDeepEqualMemo: () => useDeepEqualMemo,
      useOptionsContext: () => useOptionsContext,
      useOrganization: () => useOrganization2,
      useOrganizationContext: () => useOrganizationContext,
      useOrganizationList: () => useOrganizationList2,
      useReverification: () => useReverification2,
      useSafeLayoutEffect: () => useSafeLayoutEffect,
      useSession: () => useSession2,
      useSessionContext: () => useSessionContext,
      useSessionList: () => useSessionList2,
      useUser: () => useUser2,
      useUserContext: () => useUserContext
    });
    module.exports = __toCommonJS2(react_exports);
    var import_react = __toESM(require_react());
    function assertContextExists(contextVal, msgOrCtx) {
      if (!contextVal) {
        throw typeof msgOrCtx === "string" ? new Error(msgOrCtx) : new Error(`${msgOrCtx.displayName} not found`);
      }
    }
    var createContextAndHook = (displayName, options) => {
      const { assertCtxFn = assertContextExists } = options || {};
      const Ctx = import_react.default.createContext(void 0);
      Ctx.displayName = displayName;
      const useCtx = () => {
        const ctx = import_react.default.useContext(Ctx);
        assertCtxFn(ctx, `${displayName} not found`);
        return ctx.value;
      };
      const useCtxWithoutGuarantee = () => {
        const ctx = import_react.default.useContext(Ctx);
        return ctx ? ctx.value : {};
      };
      return [Ctx, useCtx, useCtxWithoutGuarantee];
    };
    function getCurrentOrganizationMembership(organizationMemberships, organizationId) {
      return organizationMemberships.find(
        (organizationMembership) => organizationMembership.organization.id === organizationId
      );
    }
    var EVENT_METHOD_CALLED = "METHOD_CALLED";
    function eventMethodCalled(method, payload) {
      return {
        event: EVENT_METHOD_CALLED,
        payload: {
          method,
          ...payload
        }
      };
    }
    var import_react2 = __toESM(require_react());
    var clerk_swr_exports = {};
    __export(clerk_swr_exports, {
      useSWR: () => import_swr.default,
      useSWRInfinite: () => import_infinite.default
    });
    __reExport(clerk_swr_exports, require_index());
    var import_swr = __toESM(require_index());
    var import_infinite = __toESM(require_infinite());
    var [ClerkInstanceContext, useClerkInstanceContext] = createContextAndHook("ClerkInstanceContext");
    var [UserContext, useUserContext] = createContextAndHook("UserContext");
    var [ClientContext, useClientContext] = createContextAndHook("ClientContext");
    var [SessionContext, useSessionContext] = createContextAndHook(
      "SessionContext"
    );
    var OptionsContext = import_react2.default.createContext({});
    function useOptionsContext() {
      const context = import_react2.default.useContext(OptionsContext);
      if (context === void 0) {
        throw new Error("useOptions must be used within an OptionsContext");
      }
      return context;
    }
    var [OrganizationContextInternal, useOrganizationContext] = createContextAndHook("OrganizationContext");
    var OrganizationProvider = ({
      children,
      organization,
      swrConfig
    }) => {
      return /* @__PURE__ */ import_react2.default.createElement(clerk_swr_exports.SWRConfig, { value: swrConfig }, /* @__PURE__ */ import_react2.default.createElement(
        OrganizationContextInternal.Provider,
        {
          value: {
            value: { organization }
          }
        },
        children
      ));
    };
    function useAssertWrappedByClerkProvider(displayNameOrFn) {
      const ctx = import_react2.default.useContext(ClerkInstanceContext);
      if (!ctx) {
        if (typeof displayNameOrFn === "function") {
          displayNameOrFn();
          return;
        }
        throw new Error(
          `${displayNameOrFn} can only be used within the <ClerkProvider /> component.

Possible fixes:
1. Ensure that the <ClerkProvider /> is correctly wrapping your application where this component is used.
2. Check for multiple versions of the \`@clerk/shared\` package in your project. Use a tool like \`npm ls @clerk/shared\` to identify multiple versions, and update your dependencies to only rely on one.

Learn more: https://clerk.com/docs/components/clerk-provider`.trim()
        );
      }
    }
    var import_react3 = require_react();
    function getDifferentKeys(obj1, obj2) {
      const keysSet = new Set(Object.keys(obj2));
      const differentKeysObject = {};
      for (const key1 of Object.keys(obj1)) {
        if (!keysSet.has(key1)) {
          differentKeysObject[key1] = obj1[key1];
        }
      }
      return differentKeysObject;
    }
    var useWithSafeValues = (params, defaultValues) => {
      const shouldUseDefaults = typeof params === "boolean" && params;
      const initialPageRef = (0, import_react3.useRef)(
        shouldUseDefaults ? defaultValues.initialPage : params?.initialPage ?? defaultValues.initialPage
      );
      const pageSizeRef = (0, import_react3.useRef)(shouldUseDefaults ? defaultValues.pageSize : params?.pageSize ?? defaultValues.pageSize);
      const newObj = {};
      for (const key of Object.keys(defaultValues)) {
        newObj[key] = shouldUseDefaults ? defaultValues[key] : params?.[key] ?? defaultValues[key];
      }
      return {
        ...newObj,
        initialPage: initialPageRef.current,
        pageSize: pageSizeRef.current
      };
    };
    var cachingSWROptions = {
      dedupingInterval: 1e3 * 60,
      focusThrottleInterval: 1e3 * 60 * 2
    };
    var usePagesOrInfinite = (params, fetcher, config, cacheKeys) => {
      const [paginatedPage, setPaginatedPage] = (0, import_react3.useState)(params.initialPage ?? 1);
      const initialPageRef = (0, import_react3.useRef)(params.initialPage ?? 1);
      const pageSizeRef = (0, import_react3.useRef)(params.pageSize ?? 10);
      const enabled = config.enabled ?? true;
      const triggerInfinite = config.infinite ?? false;
      const keepPreviousData = config.keepPreviousData ?? false;
      const pagesCacheKey = {
        ...cacheKeys,
        ...params,
        initialPage: paginatedPage,
        pageSize: pageSizeRef.current
      };
      const {
        data: swrData,
        isValidating: swrIsValidating,
        isLoading: swrIsLoading,
        error: swrError,
        mutate: swrMutate
      } = (0, import_swr.default)(
        !triggerInfinite && !!fetcher && enabled ? pagesCacheKey : null,
        (cacheKeyParams) => {
          const requestParams = getDifferentKeys(cacheKeyParams, cacheKeys);
          return fetcher?.(requestParams);
        },
        { keepPreviousData, ...cachingSWROptions }
      );
      const {
        data: swrInfiniteData,
        isLoading: swrInfiniteIsLoading,
        isValidating: swrInfiniteIsValidating,
        error: swrInfiniteError,
        size,
        setSize,
        mutate: swrInfiniteMutate
      } = (0, import_infinite.default)(
        (pageIndex) => {
          if (!triggerInfinite || !enabled) {
            return null;
          }
          return {
            ...params,
            ...cacheKeys,
            initialPage: initialPageRef.current + pageIndex,
            pageSize: pageSizeRef.current
          };
        },
        (cacheKeyParams) => {
          const requestParams = getDifferentKeys(cacheKeyParams, cacheKeys);
          return fetcher?.(requestParams);
        },
        cachingSWROptions
      );
      const page = (0, import_react3.useMemo)(() => {
        if (triggerInfinite) {
          return size;
        }
        return paginatedPage;
      }, [triggerInfinite, size, paginatedPage]);
      const fetchPage = (0, import_react3.useCallback)(
        (numberOrgFn) => {
          if (triggerInfinite) {
            void setSize(numberOrgFn);
            return;
          }
          return setPaginatedPage(numberOrgFn);
        },
        [setSize]
      );
      const data = (0, import_react3.useMemo)(() => {
        if (triggerInfinite) {
          return swrInfiniteData?.map((a) => a?.data).flat() ?? [];
        }
        return swrData?.data ?? [];
      }, [triggerInfinite, swrData, swrInfiniteData]);
      const count = (0, import_react3.useMemo)(() => {
        if (triggerInfinite) {
          return swrInfiniteData?.[swrInfiniteData?.length - 1]?.total_count || 0;
        }
        return swrData?.total_count ?? 0;
      }, [triggerInfinite, swrData, swrInfiniteData]);
      const isLoading = triggerInfinite ? swrInfiniteIsLoading : swrIsLoading;
      const isFetching = triggerInfinite ? swrInfiniteIsValidating : swrIsValidating;
      const error = (triggerInfinite ? swrInfiniteError : swrError) ?? null;
      const isError = !!error;
      const fetchNext = (0, import_react3.useCallback)(() => {
        fetchPage((n) => Math.max(0, n + 1));
      }, [fetchPage]);
      const fetchPrevious = (0, import_react3.useCallback)(() => {
        fetchPage((n) => Math.max(0, n - 1));
      }, [fetchPage]);
      const offsetCount = (initialPageRef.current - 1) * pageSizeRef.current;
      const pageCount = Math.ceil((count - offsetCount) / pageSizeRef.current);
      const hasNextPage = count - offsetCount * pageSizeRef.current > page * pageSizeRef.current;
      const hasPreviousPage = (page - 1) * pageSizeRef.current > offsetCount * pageSizeRef.current;
      const setData = triggerInfinite ? (value) => swrInfiniteMutate(value, {
        revalidate: false
      }) : (value) => swrMutate(value, {
        revalidate: false
      });
      const revalidate = triggerInfinite ? () => swrInfiniteMutate() : () => swrMutate();
      return {
        data,
        count,
        error,
        isLoading,
        isFetching,
        isError,
        page,
        pageCount,
        fetchPage,
        fetchNext,
        fetchPrevious,
        hasNextPage,
        hasPreviousPage,
        // Let the hook return type define this type
        revalidate,
        // Let the hook return type define this type
        setData
      };
    };
    var undefinedPaginatedResource = {
      data: void 0,
      count: void 0,
      error: void 0,
      isLoading: false,
      isFetching: false,
      isError: false,
      page: void 0,
      pageCount: void 0,
      fetchPage: void 0,
      fetchNext: void 0,
      fetchPrevious: void 0,
      hasNextPage: false,
      hasPreviousPage: false,
      revalidate: void 0,
      setData: void 0
    };
    function useOrganization2(params) {
      const {
        domains: domainListParams,
        membershipRequests: membershipRequestsListParams,
        memberships: membersListParams,
        invitations: invitationsListParams,
        subscriptions: subscriptionsListParams
      } = params || {};
      useAssertWrappedByClerkProvider("useOrganization");
      const { organization } = useOrganizationContext();
      const session = useSessionContext();
      const domainSafeValues = useWithSafeValues(domainListParams, {
        initialPage: 1,
        pageSize: 10,
        keepPreviousData: false,
        infinite: false,
        enrollmentMode: void 0
      });
      const membershipRequestSafeValues = useWithSafeValues(membershipRequestsListParams, {
        initialPage: 1,
        pageSize: 10,
        status: "pending",
        keepPreviousData: false,
        infinite: false
      });
      const membersSafeValues = useWithSafeValues(membersListParams, {
        initialPage: 1,
        pageSize: 10,
        role: void 0,
        keepPreviousData: false,
        infinite: false,
        query: void 0
      });
      const invitationsSafeValues = useWithSafeValues(invitationsListParams, {
        initialPage: 1,
        pageSize: 10,
        status: ["pending"],
        keepPreviousData: false,
        infinite: false
      });
      const subscriptionsSafeValues = useWithSafeValues(subscriptionsListParams, {
        initialPage: 1,
        pageSize: 10,
        keepPreviousData: false,
        infinite: false
      });
      const clerk = useClerkInstanceContext();
      clerk.telemetry?.record(eventMethodCalled("useOrganization"));
      const domainParams = typeof domainListParams === "undefined" ? void 0 : {
        initialPage: domainSafeValues.initialPage,
        pageSize: domainSafeValues.pageSize,
        enrollmentMode: domainSafeValues.enrollmentMode
      };
      const membershipRequestParams = typeof membershipRequestsListParams === "undefined" ? void 0 : {
        initialPage: membershipRequestSafeValues.initialPage,
        pageSize: membershipRequestSafeValues.pageSize,
        status: membershipRequestSafeValues.status
      };
      const membersParams = typeof membersListParams === "undefined" ? void 0 : {
        initialPage: membersSafeValues.initialPage,
        pageSize: membersSafeValues.pageSize,
        role: membersSafeValues.role,
        query: membersSafeValues.query
      };
      const invitationsParams = typeof invitationsListParams === "undefined" ? void 0 : {
        initialPage: invitationsSafeValues.initialPage,
        pageSize: invitationsSafeValues.pageSize,
        status: invitationsSafeValues.status
      };
      const subscriptionsParams = typeof subscriptionsListParams === "undefined" ? void 0 : {
        initialPage: subscriptionsSafeValues.initialPage,
        pageSize: subscriptionsSafeValues.pageSize,
        orgId: organization?.id
      };
      const domains = usePagesOrInfinite(
        {
          ...domainParams
        },
        organization?.getDomains,
        {
          keepPreviousData: domainSafeValues.keepPreviousData,
          infinite: domainSafeValues.infinite,
          enabled: !!domainParams
        },
        {
          type: "domains",
          organizationId: organization?.id
        }
      );
      const membershipRequests = usePagesOrInfinite(
        {
          ...membershipRequestParams
        },
        organization?.getMembershipRequests,
        {
          keepPreviousData: membershipRequestSafeValues.keepPreviousData,
          infinite: membershipRequestSafeValues.infinite,
          enabled: !!membershipRequestParams
        },
        {
          type: "membershipRequests",
          organizationId: organization?.id
        }
      );
      const memberships = usePagesOrInfinite(
        membersParams || {},
        organization?.getMemberships,
        {
          keepPreviousData: membersSafeValues.keepPreviousData,
          infinite: membersSafeValues.infinite,
          enabled: !!membersParams
        },
        {
          type: "members",
          organizationId: organization?.id
        }
      );
      const invitations = usePagesOrInfinite(
        {
          ...invitationsParams
        },
        organization?.getInvitations,
        {
          keepPreviousData: invitationsSafeValues.keepPreviousData,
          infinite: invitationsSafeValues.infinite,
          enabled: !!invitationsParams
        },
        {
          type: "invitations",
          organizationId: organization?.id
        }
      );
      const subscriptions = usePagesOrInfinite(
        {
          ...subscriptionsParams
        },
        organization?.__experimental_getSubscriptions,
        {
          keepPreviousData: subscriptionsSafeValues.keepPreviousData,
          infinite: subscriptionsSafeValues.infinite,
          enabled: !!subscriptionsParams
        },
        {
          type: "subscriptions",
          organizationId: organization?.id
        }
      );
      if (organization === void 0) {
        return {
          isLoaded: false,
          organization: void 0,
          membership: void 0,
          domains: undefinedPaginatedResource,
          membershipRequests: undefinedPaginatedResource,
          memberships: undefinedPaginatedResource,
          invitations: undefinedPaginatedResource,
          subscriptions: undefinedPaginatedResource
        };
      }
      if (organization === null) {
        return {
          isLoaded: true,
          organization: null,
          membership: null,
          domains: null,
          membershipRequests: null,
          memberships: null,
          invitations: null,
          subscriptions: null
        };
      }
      if (!clerk.loaded && organization) {
        return {
          isLoaded: true,
          organization,
          membership: void 0,
          domains: undefinedPaginatedResource,
          membershipRequests: undefinedPaginatedResource,
          memberships: undefinedPaginatedResource,
          invitations: undefinedPaginatedResource,
          subscriptions: undefinedPaginatedResource
        };
      }
      return {
        isLoaded: clerk.loaded,
        organization,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        membership: getCurrentOrganizationMembership(session.user.organizationMemberships, organization.id),
        // your membership in the current org
        domains,
        membershipRequests,
        memberships,
        invitations,
        subscriptions
      };
    }
    var undefinedPaginatedResource2 = {
      data: void 0,
      count: void 0,
      error: void 0,
      isLoading: false,
      isFetching: false,
      isError: false,
      page: void 0,
      pageCount: void 0,
      fetchPage: void 0,
      fetchNext: void 0,
      fetchPrevious: void 0,
      hasNextPage: false,
      hasPreviousPage: false,
      revalidate: void 0,
      setData: void 0
    };
    function useOrganizationList2(params) {
      const { userMemberships, userInvitations, userSuggestions } = params || {};
      useAssertWrappedByClerkProvider("useOrganizationList");
      const userMembershipsSafeValues = useWithSafeValues(userMemberships, {
        initialPage: 1,
        pageSize: 10,
        keepPreviousData: false,
        infinite: false
      });
      const userInvitationsSafeValues = useWithSafeValues(userInvitations, {
        initialPage: 1,
        pageSize: 10,
        status: "pending",
        keepPreviousData: false,
        infinite: false
      });
      const userSuggestionsSafeValues = useWithSafeValues(userSuggestions, {
        initialPage: 1,
        pageSize: 10,
        status: "pending",
        keepPreviousData: false,
        infinite: false
      });
      const clerk = useClerkInstanceContext();
      const user = useUserContext();
      clerk.telemetry?.record(eventMethodCalled("useOrganizationList"));
      const userMembershipsParams = typeof userMemberships === "undefined" ? void 0 : {
        initialPage: userMembershipsSafeValues.initialPage,
        pageSize: userMembershipsSafeValues.pageSize
      };
      const userInvitationsParams = typeof userInvitations === "undefined" ? void 0 : {
        initialPage: userInvitationsSafeValues.initialPage,
        pageSize: userInvitationsSafeValues.pageSize,
        status: userInvitationsSafeValues.status
      };
      const userSuggestionsParams = typeof userSuggestions === "undefined" ? void 0 : {
        initialPage: userSuggestionsSafeValues.initialPage,
        pageSize: userSuggestionsSafeValues.pageSize,
        status: userSuggestionsSafeValues.status
      };
      const isClerkLoaded = !!(clerk.loaded && user);
      const memberships = usePagesOrInfinite(
        userMembershipsParams || {},
        user?.getOrganizationMemberships,
        {
          keepPreviousData: userMembershipsSafeValues.keepPreviousData,
          infinite: userMembershipsSafeValues.infinite,
          enabled: !!userMembershipsParams
        },
        {
          type: "userMemberships",
          userId: user?.id
        }
      );
      const invitations = usePagesOrInfinite(
        {
          ...userInvitationsParams
        },
        user?.getOrganizationInvitations,
        {
          keepPreviousData: userInvitationsSafeValues.keepPreviousData,
          infinite: userInvitationsSafeValues.infinite,
          enabled: !!userInvitationsParams
        },
        {
          type: "userInvitations",
          userId: user?.id
        }
      );
      const suggestions = usePagesOrInfinite(
        {
          ...userSuggestionsParams
        },
        user?.getOrganizationSuggestions,
        {
          keepPreviousData: userSuggestionsSafeValues.keepPreviousData,
          infinite: userSuggestionsSafeValues.infinite,
          enabled: !!userSuggestionsParams
        },
        {
          type: "userSuggestions",
          userId: user?.id
        }
      );
      if (!isClerkLoaded) {
        return {
          isLoaded: false,
          createOrganization: void 0,
          setActive: void 0,
          userMemberships: undefinedPaginatedResource2,
          userInvitations: undefinedPaginatedResource2,
          userSuggestions: undefinedPaginatedResource2
        };
      }
      return {
        isLoaded: isClerkLoaded,
        setActive: clerk.setActive,
        createOrganization: clerk.createOrganization,
        userMemberships: memberships,
        userInvitations: invitations,
        userSuggestions: suggestions
      };
    }
    var import_react4 = __toESM(require_react());
    var useSafeLayoutEffect = typeof window !== "undefined" ? import_react4.default.useLayoutEffect : import_react4.default.useEffect;
    var useClerk2 = () => {
      useAssertWrappedByClerkProvider("useClerk");
      return useClerkInstanceContext();
    };
    var useSession2 = (options = {}) => {
      useAssertWrappedByClerkProvider("useSession");
      const session = useSessionContext();
      const clerk = useClerk2();
      if (session === void 0) {
        return { isLoaded: false, isSignedIn: void 0, session: void 0 };
      }
      const pendingAsSignedOut = session?.status === "pending" && (options.treatPendingAsSignedOut ?? clerk.__internal_getOption("treatPendingAsSignedOut"));
      const isSignedOut = session === null || pendingAsSignedOut;
      if (isSignedOut) {
        return { isLoaded: true, isSignedIn: false, session: null };
      }
      return { isLoaded: true, isSignedIn: true, session };
    };
    var useSessionList2 = () => {
      useAssertWrappedByClerkProvider("useSessionList");
      const isomorphicClerk = useClerkInstanceContext();
      const client = useClientContext();
      if (!client) {
        return { isLoaded: false, sessions: void 0, setActive: void 0 };
      }
      return {
        isLoaded: true,
        sessions: client.sessions,
        setActive: isomorphicClerk.setActive
      };
    };
    function useUser2() {
      useAssertWrappedByClerkProvider("useUser");
      const user = useUserContext();
      if (user === void 0) {
        return { isLoaded: false, isSignedIn: void 0, user: void 0 };
      }
      if (user === null) {
        return { isLoaded: true, isSignedIn: false, user: null };
      }
      return { isLoaded: true, isSignedIn: true, user };
    }
    var import_dequal = require_dist();
    var import_react5 = __toESM(require_react());
    var useDeepEqualMemoize = (value) => {
      const ref = import_react5.default.useRef(value);
      if (!(0, import_dequal.dequal)(value, ref.current)) {
        ref.current = value;
      }
      return import_react5.default.useMemo(() => ref.current, [ref.current]);
    };
    var useDeepEqualMemo = (factory, dependencyArray) => {
      return import_react5.default.useMemo(factory, useDeepEqualMemoize(dependencyArray));
    };
    var isDeeplyEqual = import_dequal.dequal;
    var import_react6 = require_react();
    var TYPES_TO_OBJECTS = {
      strict_mfa: {
        afterMinutes: 10,
        level: "multi_factor"
      },
      strict: {
        afterMinutes: 10,
        level: "second_factor"
      },
      moderate: {
        afterMinutes: 60,
        level: "second_factor"
      },
      lax: {
        afterMinutes: 1440,
        level: "second_factor"
      }
    };
    var ALLOWED_LEVELS = /* @__PURE__ */ new Set(["first_factor", "second_factor", "multi_factor"]);
    var ALLOWED_TYPES = /* @__PURE__ */ new Set(["strict_mfa", "strict", "moderate", "lax"]);
    var isValidMaxAge = (maxAge) => typeof maxAge === "number" && maxAge > 0;
    var isValidLevel = (level) => ALLOWED_LEVELS.has(level);
    var isValidVerificationType = (type) => ALLOWED_TYPES.has(type);
    var validateReverificationConfig = (config) => {
      if (!config) {
        return false;
      }
      const convertConfigToObject = (config2) => {
        if (typeof config2 === "string") {
          return TYPES_TO_OBJECTS[config2];
        }
        return config2;
      };
      const isValidStringValue = typeof config === "string" && isValidVerificationType(config);
      const isValidObjectValue = typeof config === "object" && isValidLevel(config.level) && isValidMaxAge(config.afterMinutes);
      if (isValidStringValue || isValidObjectValue) {
        return convertConfigToObject.bind(null, config);
      }
      return false;
    };
    var REVERIFICATION_REASON = "reverification-error";
    var reverificationError = (missingConfig) => ({
      clerk_error: {
        type: "forbidden",
        reason: REVERIFICATION_REASON,
        metadata: {
          reverification: missingConfig
        }
      }
    });
    var isReverificationHint = (result) => {
      return result && typeof result === "object" && "clerk_error" in result && result.clerk_error?.type === "forbidden" && result.clerk_error?.reason === REVERIFICATION_REASON;
    };
    function isClerkAPIResponseError(err) {
      return "clerkError" in err;
    }
    var ClerkRuntimeError = class _ClerkRuntimeError extends Error {
      constructor(message, { code }) {
        const prefix = "\u{1F512} Clerk:";
        const regex = new RegExp(prefix.replace(" ", "\\s*"), "i");
        const sanitized = message.replace(regex, "");
        const _message = `${prefix} ${sanitized.trim()}

(code="${code}")
`;
        super(_message);
        this.toString = () => {
          return `[${this.name}]
Message:${this.message}`;
        };
        Object.setPrototypeOf(this, _ClerkRuntimeError.prototype);
        this.code = code;
        this.message = _message;
        this.clerkRuntimeError = true;
        this.name = "ClerkRuntimeError";
      }
    };
    var DefaultMessages = Object.freeze({
      InvalidProxyUrlErrorMessage: `The proxyUrl passed to Clerk is invalid. The expected value for proxyUrl is an absolute URL or a relative path with a leading '/'. (key={{url}})`,
      InvalidPublishableKeyErrorMessage: `The publishableKey passed to Clerk is invalid. You can get your Publishable key at https://dashboard.clerk.com/last-active?path=api-keys. (key={{key}})`,
      MissingPublishableKeyErrorMessage: `Missing publishableKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.`,
      MissingSecretKeyErrorMessage: `Missing secretKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.`,
      MissingClerkProvider: `{{source}} can only be used within the <ClerkProvider /> component. Learn more: https://clerk.com/docs/components/clerk-provider`
    });
    function snakeToCamel(str) {
      return str ? str.replace(/([-_][a-z])/g, (match) => match.toUpperCase().replace(/-|_/, "")) : "";
    }
    function camelToSnake(str) {
      return str ? str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`) : "";
    }
    var createDeepObjectTransformer = (transform) => {
      const deepTransform = (obj) => {
        if (!obj) {
          return obj;
        }
        if (Array.isArray(obj)) {
          return obj.map((el) => {
            if (typeof el === "object" || Array.isArray(el)) {
              return deepTransform(el);
            }
            return el;
          });
        }
        const copy = { ...obj };
        const keys = Object.keys(copy);
        for (const oldName of keys) {
          const newName = transform(oldName.toString());
          if (newName !== oldName) {
            copy[newName] = copy[oldName];
            delete copy[oldName];
          }
          if (typeof copy[newName] === "object") {
            copy[newName] = deepTransform(copy[newName]);
          }
        }
        return copy;
      };
      return deepTransform;
    };
    var deepCamelToSnake = createDeepObjectTransformer(camelToSnake);
    var deepSnakeToCamel = createDeepObjectTransformer(snakeToCamel);
    var noop = (..._args) => {
    };
    var createDeferredPromise = () => {
      let resolve = noop;
      let reject = noop;
      const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    };
    var CLERK_API_REVERIFICATION_ERROR_CODE = "session_reverification_required";
    async function resolveResult(result) {
      try {
        const r = await result;
        if (r instanceof Response) {
          return r.json();
        }
        return r;
      } catch (e) {
        if (isClerkAPIResponseError(e) && e.errors.find(({ code }) => code === CLERK_API_REVERIFICATION_ERROR_CODE)) {
          return reverificationError();
        }
        throw e;
      }
    }
    function createReverificationHandler(params) {
      function assertReverification(fetcher) {
        return async (...args) => {
          let result = await resolveResult(fetcher(...args));
          if (isReverificationHint(result)) {
            const resolvers = createDeferredPromise();
            const isValidMetadata = validateReverificationConfig(result.clerk_error.metadata?.reverification);
            const level = isValidMetadata ? isValidMetadata().level : void 0;
            const cancel = () => {
              resolvers.reject(
                new ClerkRuntimeError("User cancelled attempted verification", {
                  code: "reverification_cancelled"
                })
              );
            };
            const complete = () => {
              resolvers.resolve(true);
            };
            if (params.onNeedsReverification === void 0) {
              params.openUIComponent?.({
                level,
                afterVerification: complete,
                afterVerificationCancelled: cancel
              });
            } else {
              params.telemetry?.record(eventMethodCalled("UserVerificationCustomUI"));
              params.onNeedsReverification({
                cancel,
                complete,
                level
              });
            }
            await resolvers.promise;
            result = await resolveResult(fetcher(...args));
          }
          return result;
        };
      }
      return assertReverification;
    }
    var useReverification2 = (fetcher, options) => {
      const { __internal_openReverification, telemetry } = useClerk2();
      const fetcherRef = (0, import_react6.useRef)(fetcher);
      const optionsRef = (0, import_react6.useRef)(options);
      const handleReverification = (0, import_react6.useMemo)(() => {
        const handler = createReverificationHandler({
          openUIComponent: __internal_openReverification,
          telemetry,
          ...optionsRef.current
        })(fetcherRef.current);
        return handler;
      }, [__internal_openReverification, fetcherRef.current, optionsRef.current]);
      useSafeLayoutEffect(() => {
        fetcherRef.current = fetcher;
        optionsRef.current = options;
      });
      return handleReverification;
    };
  }
});

// ../node_modules/@clerk/shared/dist/deprecated.js
var require_deprecated = __commonJS({
  "../node_modules/@clerk/shared/dist/deprecated.js"(exports, module) {
    "use strict";
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS2 = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
    var deprecated_exports = {};
    __export(deprecated_exports, {
      deprecated: () => deprecated,
      deprecatedObjectProperty: () => deprecatedObjectProperty,
      deprecatedProperty: () => deprecatedProperty
    });
    module.exports = __toCommonJS2(deprecated_exports);
    var isTestEnvironment = () => {
      try {
        return false;
      } catch {
      }
      return false;
    };
    var isProductionEnvironment = () => {
      try {
        return false;
      } catch {
      }
      return false;
    };
    var displayedWarnings = /* @__PURE__ */ new Set();
    var deprecated = (fnName, warning, key) => {
      const hideWarning = isTestEnvironment() || isProductionEnvironment();
      const messageId = key ?? fnName;
      if (displayedWarnings.has(messageId) || hideWarning) {
        return;
      }
      displayedWarnings.add(messageId);
      console.warn(
        `Clerk - DEPRECATION WARNING: "${fnName}" is deprecated and will be removed in the next major release.
${warning}`
      );
    };
    var deprecatedProperty = (cls, propName, warning, isStatic = false) => {
      const target = isStatic ? cls : cls.prototype;
      let value = target[propName];
      Object.defineProperty(target, propName, {
        get() {
          deprecated(propName, warning, `${cls.name}:${propName}`);
          return value;
        },
        set(v) {
          value = v;
        }
      });
    };
    var deprecatedObjectProperty = (obj, propName, warning, key) => {
      let value = obj[propName];
      Object.defineProperty(obj, propName, {
        get() {
          deprecated(propName, warning, key);
          return value;
        },
        set(v) {
          value = v;
        }
      });
    };
  }
});

// ../node_modules/@clerk/shared/dist/authorization.js
var require_authorization = __commonJS({
  "../node_modules/@clerk/shared/dist/authorization.js"(exports, module) {
    "use strict";
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS2 = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
    var authorization_exports = {};
    __export(authorization_exports, {
      createCheckAuthorization: () => createCheckAuthorization,
      resolveAuthState: () => resolveAuthState,
      splitByScope: () => splitByScope,
      validateReverificationConfig: () => validateReverificationConfig
    });
    module.exports = __toCommonJS2(authorization_exports);
    var TYPES_TO_OBJECTS = {
      strict_mfa: {
        afterMinutes: 10,
        level: "multi_factor"
      },
      strict: {
        afterMinutes: 10,
        level: "second_factor"
      },
      moderate: {
        afterMinutes: 60,
        level: "second_factor"
      },
      lax: {
        afterMinutes: 1440,
        level: "second_factor"
      }
    };
    var ALLOWED_LEVELS = /* @__PURE__ */ new Set(["first_factor", "second_factor", "multi_factor"]);
    var ALLOWED_TYPES = /* @__PURE__ */ new Set(["strict_mfa", "strict", "moderate", "lax"]);
    var isValidMaxAge = (maxAge) => typeof maxAge === "number" && maxAge > 0;
    var isValidLevel = (level) => ALLOWED_LEVELS.has(level);
    var isValidVerificationType = (type) => ALLOWED_TYPES.has(type);
    var checkOrgAuthorization = (params, options) => {
      const { orgId, orgRole, orgPermissions } = options;
      if (!params.role && !params.permission) {
        return null;
      }
      if (!orgId || !orgRole || !orgPermissions) {
        return null;
      }
      if (params.permission) {
        return orgPermissions.includes(params.permission);
      }
      if (params.role) {
        return orgRole === params.role;
      }
      return null;
    };
    var checkForFeatureOrPlan = (claim, featureOrPlan) => {
      const { org: orgFeatures, user: userFeatures } = splitByScope(claim);
      const [scope, _id] = featureOrPlan.split(":");
      const id = _id || scope;
      if (scope === "org") {
        return orgFeatures.includes(id);
      } else if (scope === "user") {
        return userFeatures.includes(id);
      } else {
        return [...orgFeatures, ...userFeatures].includes(id);
      }
    };
    var checkBillingAuthorization = (params, options) => {
      const { features, plans } = options;
      if (params.feature && features) {
        return checkForFeatureOrPlan(features, params.feature);
      }
      if (params.plan && plans) {
        return checkForFeatureOrPlan(plans, params.plan);
      }
      return null;
    };
    var splitByScope = (fea) => {
      const features = fea ? fea.split(",").map((f) => f.trim()) : [];
      return {
        org: features.filter((f) => f.split(":")[0].includes("o")).map((f) => f.split(":")[1]),
        user: features.filter((f) => f.split(":")[0].includes("u")).map((f) => f.split(":")[1])
      };
    };
    var validateReverificationConfig = (config) => {
      if (!config) {
        return false;
      }
      const convertConfigToObject = (config2) => {
        if (typeof config2 === "string") {
          return TYPES_TO_OBJECTS[config2];
        }
        return config2;
      };
      const isValidStringValue = typeof config === "string" && isValidVerificationType(config);
      const isValidObjectValue = typeof config === "object" && isValidLevel(config.level) && isValidMaxAge(config.afterMinutes);
      if (isValidStringValue || isValidObjectValue) {
        return convertConfigToObject.bind(null, config);
      }
      return false;
    };
    var checkReverificationAuthorization = (params, { factorVerificationAge }) => {
      if (!params.reverification || !factorVerificationAge) {
        return null;
      }
      const isValidReverification = validateReverificationConfig(params.reverification);
      if (!isValidReverification) {
        return null;
      }
      const { level, afterMinutes } = isValidReverification();
      const [factor1Age, factor2Age] = factorVerificationAge;
      const isValidFactor1 = factor1Age !== -1 ? afterMinutes > factor1Age : null;
      const isValidFactor2 = factor2Age !== -1 ? afterMinutes > factor2Age : null;
      switch (level) {
        case "first_factor":
          return isValidFactor1;
        case "second_factor":
          return factor2Age !== -1 ? isValidFactor2 : isValidFactor1;
        case "multi_factor":
          return factor2Age === -1 ? isValidFactor1 : isValidFactor1 && isValidFactor2;
      }
    };
    var createCheckAuthorization = (options) => {
      return (params) => {
        if (!options.userId) {
          return false;
        }
        const billingAuthorization = checkBillingAuthorization(params, options);
        const orgAuthorization = checkOrgAuthorization(params, options);
        const reverificationAuthorization = checkReverificationAuthorization(params, options);
        if ([billingAuthorization || orgAuthorization, reverificationAuthorization].some((a) => a === null)) {
          return [billingAuthorization || orgAuthorization, reverificationAuthorization].some((a) => a === true);
        }
        return [billingAuthorization || orgAuthorization, reverificationAuthorization].every((a) => a === true);
      };
    };
    var resolveAuthState = ({
      authObject: {
        sessionId,
        sessionStatus,
        userId,
        actor,
        orgId,
        orgRole,
        orgSlug,
        signOut,
        getToken,
        has,
        sessionClaims
      },
      options: { treatPendingAsSignedOut = true }
    }) => {
      if (sessionId === void 0 && userId === void 0) {
        return {
          isLoaded: false,
          isSignedIn: void 0,
          sessionId,
          sessionClaims: void 0,
          userId,
          actor: void 0,
          orgId: void 0,
          orgRole: void 0,
          orgSlug: void 0,
          has: void 0,
          signOut,
          getToken
        };
      }
      if (sessionId === null && userId === null) {
        return {
          isLoaded: true,
          isSignedIn: false,
          sessionId,
          userId,
          sessionClaims: null,
          actor: null,
          orgId: null,
          orgRole: null,
          orgSlug: null,
          has: () => false,
          signOut,
          getToken
        };
      }
      if (treatPendingAsSignedOut && sessionStatus === "pending") {
        return {
          isLoaded: true,
          isSignedIn: false,
          sessionId: null,
          userId: null,
          sessionClaims: null,
          actor: null,
          orgId: null,
          orgRole: null,
          orgSlug: null,
          has: () => false,
          signOut,
          getToken
        };
      }
      if (!!sessionId && !!sessionClaims && !!userId && !!orgId && !!orgRole) {
        return {
          isLoaded: true,
          isSignedIn: true,
          sessionId,
          sessionClaims,
          userId,
          actor: actor || null,
          orgId,
          orgRole,
          orgSlug: orgSlug || null,
          has,
          signOut,
          getToken
        };
      }
      if (!!sessionId && !!sessionClaims && !!userId && !orgId) {
        return {
          isLoaded: true,
          isSignedIn: true,
          sessionId,
          sessionClaims,
          userId,
          actor: actor || null,
          orgId: null,
          orgRole: null,
          orgSlug: null,
          has,
          signOut,
          getToken
        };
      }
    };
  }
});

// ../node_modules/@clerk/shared/dist/telemetry.js
var require_telemetry = __commonJS({
  "../node_modules/@clerk/shared/dist/telemetry.js"(exports, module) {
    "use strict";
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __typeError = (msg) => {
      throw TypeError(msg);
    };
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS2 = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
    var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
    var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
    var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
    var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
    var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
    var telemetry_exports = {};
    __export(telemetry_exports, {
      TelemetryCollector: () => TelemetryCollector,
      eventComponentMounted: () => eventComponentMounted,
      eventFrameworkMetadata: () => eventFrameworkMetadata,
      eventMethodCalled: () => eventMethodCalled,
      eventPrebuiltComponentMounted: () => eventPrebuiltComponentMounted,
      eventPrebuiltComponentOpened: () => eventPrebuiltComponentOpened
    });
    module.exports = __toCommonJS2(telemetry_exports);
    var isomorphicAtob = (data) => {
      if (typeof atob !== "undefined" && typeof atob === "function") {
        return atob(data);
      } else if (typeof globalThis !== "undefined" && globalThis.Buffer) {
        return new globalThis.Buffer(data, "base64").toString();
      }
      return data;
    };
    var PUBLISHABLE_KEY_LIVE_PREFIX = "pk_live_";
    var PUBLISHABLE_KEY_TEST_PREFIX = "pk_test_";
    function parsePublishableKey(key, options = {}) {
      key = key || "";
      if (!key || !isPublishableKey(key)) {
        if (options.fatal && !key) {
          throw new Error(
            "Publishable key is missing. Ensure that your publishable key is correctly configured. Double-check your environment configuration for your keys, or access them here: https://dashboard.clerk.com/last-active?path=api-keys"
          );
        }
        if (options.fatal && !isPublishableKey(key)) {
          throw new Error("Publishable key not valid.");
        }
        return null;
      }
      const instanceType = key.startsWith(PUBLISHABLE_KEY_LIVE_PREFIX) ? "production" : "development";
      let frontendApi = isomorphicAtob(key.split("_")[2]);
      frontendApi = frontendApi.slice(0, -1);
      if (options.proxyUrl) {
        frontendApi = options.proxyUrl;
      } else if (instanceType !== "development" && options.domain) {
        frontendApi = `clerk.${options.domain}`;
      }
      return {
        instanceType,
        frontendApi
      };
    }
    function isPublishableKey(key = "") {
      try {
        const hasValidPrefix = key.startsWith(PUBLISHABLE_KEY_LIVE_PREFIX) || key.startsWith(PUBLISHABLE_KEY_TEST_PREFIX);
        const hasValidFrontendApiPostfix = isomorphicAtob(key.split("_")[2] || "").endsWith("$");
        return hasValidPrefix && hasValidFrontendApiPostfix;
      } catch {
        return false;
      }
    }
    function snakeToCamel(str) {
      return str ? str.replace(/([-_][a-z])/g, (match) => match.toUpperCase().replace(/-|_/, "")) : "";
    }
    function camelToSnake(str) {
      return str ? str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`) : "";
    }
    var createDeepObjectTransformer = (transform) => {
      const deepTransform = (obj) => {
        if (!obj) {
          return obj;
        }
        if (Array.isArray(obj)) {
          return obj.map((el) => {
            if (typeof el === "object" || Array.isArray(el)) {
              return deepTransform(el);
            }
            return el;
          });
        }
        const copy = { ...obj };
        const keys = Object.keys(copy);
        for (const oldName of keys) {
          const newName = transform(oldName.toString());
          if (newName !== oldName) {
            copy[newName] = copy[oldName];
            delete copy[oldName];
          }
          if (typeof copy[newName] === "object") {
            copy[newName] = deepTransform(copy[newName]);
          }
        }
        return copy;
      };
      return deepTransform;
    };
    var deepCamelToSnake = createDeepObjectTransformer(camelToSnake);
    var deepSnakeToCamel = createDeepObjectTransformer(snakeToCamel);
    function isTruthy(value) {
      if (typeof value === `boolean`) {
        return value;
      }
      if (value === void 0 || value === null) {
        return false;
      }
      if (typeof value === `string`) {
        if (value.toLowerCase() === `true`) {
          return true;
        }
        if (value.toLowerCase() === `false`) {
          return false;
        }
      }
      const number = parseInt(value, 10);
      if (isNaN(number)) {
        return false;
      }
      if (number > 0) {
        return true;
      }
      return false;
    }
    var DEFAULT_CACHE_TTL_MS = 864e5;
    var _storageKey;
    var _cacheTtl;
    var _TelemetryEventThrottler_instances;
    var generateKey_fn;
    var cache_get;
    var isValidBrowser_get;
    var TelemetryEventThrottler = class {
      constructor() {
        __privateAdd(this, _TelemetryEventThrottler_instances);
        __privateAdd(this, _storageKey, "clerk_telemetry_throttler");
        __privateAdd(this, _cacheTtl, DEFAULT_CACHE_TTL_MS);
      }
      isEventThrottled(payload) {
        if (!__privateGet(this, _TelemetryEventThrottler_instances, isValidBrowser_get)) {
          return false;
        }
        const now = Date.now();
        const key = __privateMethod(this, _TelemetryEventThrottler_instances, generateKey_fn).call(this, payload);
        const entry = __privateGet(this, _TelemetryEventThrottler_instances, cache_get)?.[key];
        if (!entry) {
          const updatedCache = {
            ...__privateGet(this, _TelemetryEventThrottler_instances, cache_get),
            [key]: now
          };
          localStorage.setItem(__privateGet(this, _storageKey), JSON.stringify(updatedCache));
        }
        const shouldInvalidate = entry && now - entry > __privateGet(this, _cacheTtl);
        if (shouldInvalidate) {
          const updatedCache = __privateGet(this, _TelemetryEventThrottler_instances, cache_get);
          delete updatedCache[key];
          localStorage.setItem(__privateGet(this, _storageKey), JSON.stringify(updatedCache));
        }
        return !!entry;
      }
    };
    _storageKey = /* @__PURE__ */ new WeakMap();
    _cacheTtl = /* @__PURE__ */ new WeakMap();
    _TelemetryEventThrottler_instances = /* @__PURE__ */ new WeakSet();
    generateKey_fn = function(event) {
      const { sk: _sk, pk: _pk, payload, ...rest } = event;
      const sanitizedEvent = {
        ...payload,
        ...rest
      };
      return JSON.stringify(
        Object.keys({
          ...payload,
          ...rest
        }).sort().map((key) => sanitizedEvent[key])
      );
    };
    cache_get = function() {
      const cacheString = localStorage.getItem(__privateGet(this, _storageKey));
      if (!cacheString) {
        return {};
      }
      return JSON.parse(cacheString);
    };
    isValidBrowser_get = function() {
      if (typeof window === "undefined") {
        return false;
      }
      const storage = window.localStorage;
      if (!storage) {
        return false;
      }
      try {
        const testKey = "test";
        storage.setItem(testKey, testKey);
        storage.removeItem(testKey);
        return true;
      } catch (err) {
        const isQuotaExceededError = err instanceof DOMException && // Check error names for different browsers
        (err.name === "QuotaExceededError" || err.name === "NS_ERROR_DOM_QUOTA_REACHED");
        if (isQuotaExceededError && storage.length > 0) {
          storage.removeItem(__privateGet(this, _storageKey));
        }
        return false;
      }
    };
    var DEFAULT_CONFIG = {
      samplingRate: 1,
      maxBufferSize: 5,
      // Production endpoint: https://clerk-telemetry.com
      // Staging endpoint: https://staging.clerk-telemetry.com
      // Local: http://localhost:8787
      endpoint: "https://clerk-telemetry.com"
    };
    var _config;
    var _eventThrottler;
    var _metadata;
    var _buffer;
    var _pendingFlush;
    var _TelemetryCollector_instances;
    var shouldRecord_fn;
    var shouldBeSampled_fn;
    var scheduleFlush_fn;
    var flush_fn;
    var logEvent_fn;
    var getSDKMetadata_fn;
    var preparePayload_fn;
    var TelemetryCollector = class {
      constructor(options) {
        __privateAdd(this, _TelemetryCollector_instances);
        __privateAdd(this, _config);
        __privateAdd(this, _eventThrottler);
        __privateAdd(this, _metadata, {});
        __privateAdd(this, _buffer, []);
        __privateAdd(this, _pendingFlush);
        __privateSet(this, _config, {
          maxBufferSize: options.maxBufferSize ?? DEFAULT_CONFIG.maxBufferSize,
          samplingRate: options.samplingRate ?? DEFAULT_CONFIG.samplingRate,
          disabled: options.disabled ?? false,
          debug: options.debug ?? false,
          endpoint: DEFAULT_CONFIG.endpoint
        });
        if (!options.clerkVersion && typeof window === "undefined") {
          __privateGet(this, _metadata).clerkVersion = "";
        } else {
          __privateGet(this, _metadata).clerkVersion = options.clerkVersion ?? "";
        }
        __privateGet(this, _metadata).sdk = options.sdk;
        __privateGet(this, _metadata).sdkVersion = options.sdkVersion;
        __privateGet(this, _metadata).publishableKey = options.publishableKey ?? "";
        const parsedKey = parsePublishableKey(options.publishableKey);
        if (parsedKey) {
          __privateGet(this, _metadata).instanceType = parsedKey.instanceType;
        }
        if (options.secretKey) {
          __privateGet(this, _metadata).secretKey = options.secretKey.substring(0, 16);
        }
        __privateSet(this, _eventThrottler, new TelemetryEventThrottler());
      }
      get isEnabled() {
        if (__privateGet(this, _metadata).instanceType !== "development") {
          return false;
        }
        if (__privateGet(this, _config).disabled || typeof process !== "undefined" && isTruthy(process.env.CLERK_TELEMETRY_DISABLED)) {
          return false;
        }
        if (typeof window !== "undefined" && !!window?.navigator?.webdriver) {
          return false;
        }
        return true;
      }
      get isDebug() {
        return __privateGet(this, _config).debug || typeof process !== "undefined" && isTruthy(process.env.CLERK_TELEMETRY_DEBUG);
      }
      record(event) {
        const preparedPayload = __privateMethod(this, _TelemetryCollector_instances, preparePayload_fn).call(this, event.event, event.payload);
        __privateMethod(this, _TelemetryCollector_instances, logEvent_fn).call(this, preparedPayload.event, preparedPayload);
        if (!__privateMethod(this, _TelemetryCollector_instances, shouldRecord_fn).call(this, preparedPayload, event.eventSamplingRate)) {
          return;
        }
        __privateGet(this, _buffer).push(preparedPayload);
        __privateMethod(this, _TelemetryCollector_instances, scheduleFlush_fn).call(this);
      }
    };
    _config = /* @__PURE__ */ new WeakMap();
    _eventThrottler = /* @__PURE__ */ new WeakMap();
    _metadata = /* @__PURE__ */ new WeakMap();
    _buffer = /* @__PURE__ */ new WeakMap();
    _pendingFlush = /* @__PURE__ */ new WeakMap();
    _TelemetryCollector_instances = /* @__PURE__ */ new WeakSet();
    shouldRecord_fn = function(preparedPayload, eventSamplingRate) {
      return this.isEnabled && !this.isDebug && __privateMethod(this, _TelemetryCollector_instances, shouldBeSampled_fn).call(this, preparedPayload, eventSamplingRate);
    };
    shouldBeSampled_fn = function(preparedPayload, eventSamplingRate) {
      const randomSeed = Math.random();
      const toBeSampled = randomSeed <= __privateGet(this, _config).samplingRate && (typeof eventSamplingRate === "undefined" || randomSeed <= eventSamplingRate);
      if (!toBeSampled) {
        return false;
      }
      return !__privateGet(this, _eventThrottler).isEventThrottled(preparedPayload);
    };
    scheduleFlush_fn = function() {
      if (typeof window === "undefined") {
        __privateMethod(this, _TelemetryCollector_instances, flush_fn).call(this);
        return;
      }
      const isBufferFull = __privateGet(this, _buffer).length >= __privateGet(this, _config).maxBufferSize;
      if (isBufferFull) {
        if (__privateGet(this, _pendingFlush)) {
          const cancel = typeof cancelIdleCallback !== "undefined" ? cancelIdleCallback : clearTimeout;
          cancel(__privateGet(this, _pendingFlush));
        }
        __privateMethod(this, _TelemetryCollector_instances, flush_fn).call(this);
        return;
      }
      if (__privateGet(this, _pendingFlush)) {
        return;
      }
      if ("requestIdleCallback" in window) {
        __privateSet(this, _pendingFlush, requestIdleCallback(() => {
          __privateMethod(this, _TelemetryCollector_instances, flush_fn).call(this);
        }));
      } else {
        __privateSet(this, _pendingFlush, setTimeout(() => {
          __privateMethod(this, _TelemetryCollector_instances, flush_fn).call(this);
        }, 0));
      }
    };
    flush_fn = function() {
      fetch(new URL("/v1/event", __privateGet(this, _config).endpoint), {
        method: "POST",
        // TODO: We send an array here with that idea that we can eventually send multiple events.
        body: JSON.stringify({
          events: __privateGet(this, _buffer)
        }),
        headers: {
          "Content-Type": "application/json"
        }
      }).catch(() => void 0).then(() => {
        __privateSet(this, _buffer, []);
      }).catch(() => void 0);
    };
    logEvent_fn = function(event, payload) {
      if (!this.isDebug) {
        return;
      }
      if (typeof console.groupCollapsed !== "undefined") {
        console.groupCollapsed("[clerk/telemetry]", event);
        console.log(payload);
        console.groupEnd();
      } else {
        console.log("[clerk/telemetry]", event, payload);
      }
    };
    getSDKMetadata_fn = function() {
      let sdkMetadata = {
        name: __privateGet(this, _metadata).sdk,
        version: __privateGet(this, _metadata).sdkVersion
      };
      if (typeof window !== "undefined" && window.Clerk) {
        sdkMetadata = { ...sdkMetadata, ...window.Clerk.constructor.sdkMetadata };
      }
      return sdkMetadata;
    };
    preparePayload_fn = function(event, payload) {
      const sdkMetadata = __privateMethod(this, _TelemetryCollector_instances, getSDKMetadata_fn).call(this);
      return {
        event,
        cv: __privateGet(this, _metadata).clerkVersion ?? "",
        it: __privateGet(this, _metadata).instanceType ?? "",
        sdk: sdkMetadata.name,
        sdkv: sdkMetadata.version,
        ...__privateGet(this, _metadata).publishableKey ? { pk: __privateGet(this, _metadata).publishableKey } : {},
        ...__privateGet(this, _metadata).secretKey ? { sk: __privateGet(this, _metadata).secretKey } : {},
        payload
      };
    };
    var EVENT_COMPONENT_MOUNTED = "COMPONENT_MOUNTED";
    var EVENT_COMPONENT_OPENED = "COMPONENT_OPENED";
    var EVENT_SAMPLING_RATE = 0.1;
    function createPrebuiltComponentEvent(event) {
      return function(component, props, additionalPayload) {
        return {
          event,
          eventSamplingRate: EVENT_SAMPLING_RATE,
          payload: {
            component,
            appearanceProp: Boolean(props?.appearance),
            baseTheme: Boolean(props?.appearance?.baseTheme),
            elements: Boolean(props?.appearance?.elements),
            variables: Boolean(props?.appearance?.variables),
            ...additionalPayload
          }
        };
      };
    }
    function eventPrebuiltComponentMounted(component, props, additionalPayload) {
      return createPrebuiltComponentEvent(EVENT_COMPONENT_MOUNTED)(component, props, additionalPayload);
    }
    function eventPrebuiltComponentOpened(component, props, additionalPayload) {
      return createPrebuiltComponentEvent(EVENT_COMPONENT_OPENED)(component, props, additionalPayload);
    }
    function eventComponentMounted(component, props = {}) {
      return {
        event: EVENT_COMPONENT_MOUNTED,
        eventSamplingRate: EVENT_SAMPLING_RATE,
        payload: {
          component,
          ...props
        }
      };
    }
    var EVENT_METHOD_CALLED = "METHOD_CALLED";
    function eventMethodCalled(method, payload) {
      return {
        event: EVENT_METHOD_CALLED,
        payload: {
          method,
          ...payload
        }
      };
    }
    var EVENT_FRAMEWORK_METADATA = "FRAMEWORK_METADATA";
    var EVENT_SAMPLING_RATE2 = 0.1;
    function eventFrameworkMetadata(payload) {
      return {
        event: EVENT_FRAMEWORK_METADATA,
        eventSamplingRate: EVENT_SAMPLING_RATE2,
        payload
      };
    }
  }
});

// ../node_modules/@clerk/shared/dist/keys.js
var require_keys = __commonJS({
  "../node_modules/@clerk/shared/dist/keys.js"(exports, module) {
    "use strict";
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS2 = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
    var keys_exports = {};
    __export(keys_exports, {
      buildPublishableKey: () => buildPublishableKey,
      createDevOrStagingUrlCache: () => createDevOrStagingUrlCache,
      getCookieSuffix: () => getCookieSuffix,
      getSuffixedCookieName: () => getSuffixedCookieName,
      isDevelopmentFromPublishableKey: () => isDevelopmentFromPublishableKey,
      isDevelopmentFromSecretKey: () => isDevelopmentFromSecretKey,
      isProductionFromPublishableKey: () => isProductionFromPublishableKey,
      isProductionFromSecretKey: () => isProductionFromSecretKey,
      isPublishableKey: () => isPublishableKey,
      parsePublishableKey: () => parsePublishableKey
    });
    module.exports = __toCommonJS2(keys_exports);
    var LEGACY_DEV_INSTANCE_SUFFIXES = [".lcl.dev", ".lclstage.dev", ".lclclerk.com"];
    var DEV_OR_STAGING_SUFFIXES = [
      ".lcl.dev",
      ".stg.dev",
      ".lclstage.dev",
      ".stgstage.dev",
      ".dev.lclclerk.com",
      ".stg.lclclerk.com",
      ".accounts.lclclerk.com",
      "accountsstage.dev",
      "accounts.dev"
    ];
    var isomorphicAtob = (data) => {
      if (typeof atob !== "undefined" && typeof atob === "function") {
        return atob(data);
      } else if (typeof globalThis !== "undefined" && globalThis.Buffer) {
        return new globalThis.Buffer(data, "base64").toString();
      }
      return data;
    };
    var isomorphicBtoa = (data) => {
      if (typeof btoa !== "undefined" && typeof btoa === "function") {
        return btoa(data);
      } else if (typeof globalThis !== "undefined" && globalThis.Buffer) {
        return new globalThis.Buffer(data).toString("base64");
      }
      return data;
    };
    var PUBLISHABLE_KEY_LIVE_PREFIX = "pk_live_";
    var PUBLISHABLE_KEY_TEST_PREFIX = "pk_test_";
    var PUBLISHABLE_FRONTEND_API_DEV_REGEX = /^(([a-z]+)-){2}([0-9]{1,2})\.clerk\.accounts([a-z.]*)(dev|com)$/i;
    function buildPublishableKey(frontendApi) {
      const isDevKey = PUBLISHABLE_FRONTEND_API_DEV_REGEX.test(frontendApi) || frontendApi.startsWith("clerk.") && LEGACY_DEV_INSTANCE_SUFFIXES.some((s) => frontendApi.endsWith(s));
      const keyPrefix = isDevKey ? PUBLISHABLE_KEY_TEST_PREFIX : PUBLISHABLE_KEY_LIVE_PREFIX;
      return `${keyPrefix}${isomorphicBtoa(`${frontendApi}$`)}`;
    }
    function parsePublishableKey(key, options = {}) {
      key = key || "";
      if (!key || !isPublishableKey(key)) {
        if (options.fatal && !key) {
          throw new Error(
            "Publishable key is missing. Ensure that your publishable key is correctly configured. Double-check your environment configuration for your keys, or access them here: https://dashboard.clerk.com/last-active?path=api-keys"
          );
        }
        if (options.fatal && !isPublishableKey(key)) {
          throw new Error("Publishable key not valid.");
        }
        return null;
      }
      const instanceType = key.startsWith(PUBLISHABLE_KEY_LIVE_PREFIX) ? "production" : "development";
      let frontendApi = isomorphicAtob(key.split("_")[2]);
      frontendApi = frontendApi.slice(0, -1);
      if (options.proxyUrl) {
        frontendApi = options.proxyUrl;
      } else if (instanceType !== "development" && options.domain) {
        frontendApi = `clerk.${options.domain}`;
      }
      return {
        instanceType,
        frontendApi
      };
    }
    function isPublishableKey(key = "") {
      try {
        const hasValidPrefix = key.startsWith(PUBLISHABLE_KEY_LIVE_PREFIX) || key.startsWith(PUBLISHABLE_KEY_TEST_PREFIX);
        const hasValidFrontendApiPostfix = isomorphicAtob(key.split("_")[2] || "").endsWith("$");
        return hasValidPrefix && hasValidFrontendApiPostfix;
      } catch {
        return false;
      }
    }
    function createDevOrStagingUrlCache() {
      const devOrStagingUrlCache = /* @__PURE__ */ new Map();
      return {
        isDevOrStagingUrl: (url) => {
          if (!url) {
            return false;
          }
          const hostname = typeof url === "string" ? url : url.hostname;
          let res = devOrStagingUrlCache.get(hostname);
          if (res === void 0) {
            res = DEV_OR_STAGING_SUFFIXES.some((s) => hostname.endsWith(s));
            devOrStagingUrlCache.set(hostname, res);
          }
          return res;
        }
      };
    }
    function isDevelopmentFromPublishableKey(apiKey) {
      return apiKey.startsWith("test_") || apiKey.startsWith("pk_test_");
    }
    function isProductionFromPublishableKey(apiKey) {
      return apiKey.startsWith("live_") || apiKey.startsWith("pk_live_");
    }
    function isDevelopmentFromSecretKey(apiKey) {
      return apiKey.startsWith("test_") || apiKey.startsWith("sk_test_");
    }
    function isProductionFromSecretKey(apiKey) {
      return apiKey.startsWith("live_") || apiKey.startsWith("sk_live_");
    }
    async function getCookieSuffix(publishableKey, subtle = globalThis.crypto.subtle) {
      const data = new TextEncoder().encode(publishableKey);
      const digest = await subtle.digest("sha-1", data);
      const stringDigest = String.fromCharCode(...new Uint8Array(digest));
      return isomorphicBtoa(stringDigest).replace(/\+/gi, "-").replace(/\//gi, "_").substring(0, 8);
    }
    var getSuffixedCookieName = (cookieName, cookieSuffix) => {
      return `${cookieName}_${cookieSuffix}`;
    };
  }
});

// ../node_modules/@clerk/shared/dist/deriveState.js
var require_deriveState = __commonJS({
  "../node_modules/@clerk/shared/dist/deriveState.js"(exports, module) {
    "use strict";
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS2 = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
    var deriveState_exports = {};
    __export(deriveState_exports, {
      deriveState: () => deriveState
    });
    module.exports = __toCommonJS2(deriveState_exports);
    var deriveState = (clerkOperational, state, initialState) => {
      if (!clerkOperational && initialState) {
        return deriveFromSsrInitialState(initialState);
      }
      return deriveFromClientSideState(state);
    };
    var deriveFromSsrInitialState = (initialState) => {
      const userId = initialState.userId;
      const user = initialState.user;
      const sessionId = initialState.sessionId;
      const sessionStatus = initialState.sessionStatus;
      const sessionClaims = initialState.sessionClaims;
      const session = initialState.session;
      const organization = initialState.organization;
      const orgId = initialState.orgId;
      const orgRole = initialState.orgRole;
      const orgPermissions = initialState.orgPermissions;
      const orgSlug = initialState.orgSlug;
      const actor = initialState.actor;
      const factorVerificationAge = initialState.factorVerificationAge;
      return {
        userId,
        user,
        sessionId,
        session,
        sessionStatus,
        sessionClaims,
        organization,
        orgId,
        orgRole,
        orgPermissions,
        orgSlug,
        actor,
        factorVerificationAge
      };
    };
    var deriveFromClientSideState = (state) => {
      const userId = state.user ? state.user.id : state.user;
      const user = state.user;
      const sessionId = state.session ? state.session.id : state.session;
      const session = state.session;
      const sessionStatus = state.session?.status;
      const sessionClaims = state.session ? state.session.lastActiveToken?.jwt?.claims : null;
      const factorVerificationAge = state.session ? state.session.factorVerificationAge : null;
      const actor = session?.actor;
      const organization = state.organization;
      const orgId = state.organization ? state.organization.id : state.organization;
      const orgSlug = organization?.slug;
      const membership = organization ? user?.organizationMemberships?.find((om) => om.organization.id === orgId) : organization;
      const orgPermissions = membership ? membership.permissions : membership;
      const orgRole = membership ? membership.role : membership;
      return {
        userId,
        user,
        sessionId,
        session,
        sessionStatus,
        sessionClaims,
        organization,
        orgId,
        orgRole,
        orgSlug,
        orgPermissions,
        actor,
        factorVerificationAge
      };
    };
  }
});

// ../node_modules/@clerk/shared/dist/browser.js
var require_browser = __commonJS({
  "../node_modules/@clerk/shared/dist/browser.js"(exports, module) {
    "use strict";
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS2 = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
    var browser_exports = {};
    __export(browser_exports, {
      inBrowser: () => inBrowser,
      isBrowserOnline: () => isBrowserOnline,
      isValidBrowser: () => isValidBrowser,
      isValidBrowserOnline: () => isValidBrowserOnline,
      userAgentIsRobot: () => userAgentIsRobot
    });
    module.exports = __toCommonJS2(browser_exports);
    function inBrowser() {
      return typeof window !== "undefined";
    }
    var botAgents = [
      "bot",
      "spider",
      "crawl",
      "APIs-Google",
      "AdsBot",
      "Googlebot",
      "mediapartners",
      "Google Favicon",
      "FeedFetcher",
      "Google-Read-Aloud",
      "DuplexWeb-Google",
      "googleweblight",
      "bing",
      "yandex",
      "baidu",
      "duckduck",
      "yahoo",
      "ecosia",
      "ia_archiver",
      "facebook",
      "instagram",
      "pinterest",
      "reddit",
      "slack",
      "twitter",
      "whatsapp",
      "youtube",
      "semrush"
    ];
    var botAgentRegex = new RegExp(botAgents.join("|"), "i");
    function userAgentIsRobot(userAgent) {
      return !userAgent ? false : botAgentRegex.test(userAgent);
    }
    function isValidBrowser() {
      const navigator2 = inBrowser() ? window?.navigator : null;
      if (!navigator2) {
        return false;
      }
      return !userAgentIsRobot(navigator2?.userAgent) && !navigator2?.webdriver;
    }
    function isBrowserOnline() {
      const navigator2 = inBrowser() ? window?.navigator : null;
      if (!navigator2) {
        return false;
      }
      const isNavigatorOnline = navigator2?.onLine;
      const isExperimentalConnectionOnline = navigator2?.connection?.rtt !== 0 && navigator2?.connection?.downlink !== 0;
      return isExperimentalConnectionOnline && isNavigatorOnline;
    }
    function isValidBrowserOnline() {
      return isBrowserOnline() && isValidBrowser();
    }
  }
});

// ../node_modules/@clerk/shared/dist/clerkEventBus.js
var require_clerkEventBus = __commonJS({
  "../node_modules/@clerk/shared/dist/clerkEventBus.js"(exports, module) {
    "use strict";
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS2 = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
    var clerkEventBus_exports = {};
    __export(clerkEventBus_exports, {
      clerkEvents: () => clerkEvents,
      createClerkEventBus: () => createClerkEventBus
    });
    module.exports = __toCommonJS2(clerkEventBus_exports);
    var _on = (eventToHandlersMap, latestPayloadMap, event, handler, opts) => {
      const { notify } = opts || {};
      let handlers = eventToHandlersMap.get(event);
      if (!handlers) {
        handlers = [];
        eventToHandlersMap.set(event, handlers);
      }
      handlers.push(handler);
      if (notify && latestPayloadMap.has(event)) {
        handler(latestPayloadMap.get(event));
      }
    };
    var _dispatch = (eventToHandlersMap, event, payload) => (eventToHandlersMap.get(event) || []).map((h) => h(payload));
    var _off = (eventToHandlersMap, event, handler) => {
      const handlers = eventToHandlersMap.get(event);
      if (handlers) {
        if (handler) {
          handlers.splice(handlers.indexOf(handler) >>> 0, 1);
        } else {
          eventToHandlersMap.set(event, []);
        }
      }
    };
    var createEventBus = () => {
      const eventToHandlersMap = /* @__PURE__ */ new Map();
      const latestPayloadMap = /* @__PURE__ */ new Map();
      const eventToPredispatchHandlersMap = /* @__PURE__ */ new Map();
      const emit = (event, payload) => {
        latestPayloadMap.set(event, payload);
        _dispatch(eventToPredispatchHandlersMap, event, payload);
        _dispatch(eventToHandlersMap, event, payload);
      };
      return {
        // Subscribe to an event
        on: (...args) => _on(eventToHandlersMap, latestPayloadMap, ...args),
        // Subscribe to an event with priority
        // Registered handlers with `prioritizedOn` will be called before handlers registered with `on`
        prioritizedOn: (...args) => _on(eventToPredispatchHandlersMap, latestPayloadMap, ...args),
        // Dispatch an event
        emit,
        // Unsubscribe from an event
        off: (...args) => _off(eventToHandlersMap, ...args),
        // Unsubscribe from an event with priority
        // Unsubscribes handlers only registered with `prioritizedOn`
        prioritizedOff: (...args) => _off(eventToPredispatchHandlersMap, ...args),
        // Internal utilities
        internal: {
          retrieveListeners: (event) => eventToHandlersMap.get(event) || []
        }
      };
    };
    var clerkEvents = {
      Status: "status"
    };
    var createClerkEventBus = () => {
      return createEventBus();
    };
  }
});

// ../node_modules/@clerk/clerk-react/dist/index.js
var require_dist2 = __commonJS({
  "../node_modules/@clerk/clerk-react/dist/index.js"(exports, module) {
    "use strict";
    var __create = Object.create;
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __getProtoOf = Object.getPrototypeOf;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __typeError = (msg) => {
      throw TypeError(msg);
    };
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
      // If the importer is in node compatibility mode or this is not an ESM
      // file that has been converted to a CommonJS file using a Babel-
      // compatible transform (i.e. "__esModule" has not been set), then set
      // "default" to the CommonJS "module.exports" for node compatibility.
      isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
      mod
    ));
    var __toCommonJS2 = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
    var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
    var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
    var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
    var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
    var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
    var src_exports = {};
    __export(src_exports, {
      AuthenticateWithRedirectCallback: () => AuthenticateWithRedirectCallback,
      ClerkDegraded: () => ClerkDegraded,
      ClerkFailed: () => ClerkFailed,
      ClerkLoaded: () => ClerkLoaded,
      ClerkLoading: () => ClerkLoading,
      ClerkProvider: () => ClerkProvider,
      CreateOrganization: () => CreateOrganization,
      GoogleOneTap: () => GoogleOneTap,
      OrganizationList: () => OrganizationList,
      OrganizationProfile: () => OrganizationProfile2,
      OrganizationSwitcher: () => OrganizationSwitcher,
      Protect: () => Protect,
      RedirectToCreateOrganization: () => RedirectToCreateOrganization,
      RedirectToOrganizationProfile: () => RedirectToOrganizationProfile,
      RedirectToSignIn: () => RedirectToSignIn,
      RedirectToSignUp: () => RedirectToSignUp,
      RedirectToUserProfile: () => RedirectToUserProfile,
      SignIn: () => SignIn2,
      SignInButton: () => SignInButton,
      SignInWithMetamaskButton: () => SignInWithMetamaskButton,
      SignOutButton: () => SignOutButton,
      SignUp: () => SignUp2,
      SignUpButton: () => SignUpButton,
      SignedIn: () => SignedIn,
      SignedOut: () => SignedOut,
      UserButton: () => UserButton,
      UserProfile: () => UserProfile2,
      Waitlist: () => Waitlist,
      __experimental_PricingTable: () => __experimental_PricingTable,
      useAuth: () => useAuth,
      useClerk: () => import_react20.useClerk,
      useEmailLink: () => useEmailLink,
      useOrganization: () => import_react20.useOrganization,
      useOrganizationList: () => import_react20.useOrganizationList,
      useReverification: () => import_react20.useReverification,
      useSession: () => import_react20.useSession,
      useSessionList: () => import_react20.useSessionList,
      useSignIn: () => useSignIn,
      useSignUp: () => useSignUp,
      useUser: () => import_react20.useUser
    });
    module.exports = __toCommonJS2(src_exports);
    if (typeof window !== "undefined" && !window.global) {
      window.global = typeof globalThis === "undefined" ? window : globalThis;
    }
    var import_loadClerkJsScript2 = require_loadClerkJsScript();
    var import_error = require_error();
    var errorThrower = (0, import_error.buildErrorThrower)({ packageName: "@clerk/clerk-react" });
    function setErrorThrowerOptions(options) {
      errorThrower.setMessages(options).setPackageName(options);
    }
    var import_utils3 = require_utils();
    var import_react13 = __toESM(require_react());
    var multipleClerkProvidersError = "You've added multiple <ClerkProvider> components in your React component tree. Wrap your components in a single <ClerkProvider>.";
    var multipleChildrenInButtonComponent = (name) => `You've passed multiple children components to <${name}/>. You can only pass a single child component or text.`;
    var invalidStateError = "Invalid state. Feel free to submit a bug or reach out to support here: https://clerk.com/support";
    var unsupportedNonBrowserDomainOrProxyUrlFunction = "Unsupported usage of isSatellite, domain or proxyUrl. The usage of isSatellite, domain or proxyUrl as function is not supported in non-browser environments.";
    var userProfilePageRenderedError = "<UserProfile.Page /> component needs to be a direct child of `<UserProfile />` or `<UserButton />`.";
    var userProfileLinkRenderedError = "<UserProfile.Link /> component needs to be a direct child of `<UserProfile />` or `<UserButton />`.";
    var organizationProfilePageRenderedError = "<OrganizationProfile.Page /> component needs to be a direct child of `<OrganizationProfile />` or `<OrganizationSwitcher />`.";
    var organizationProfileLinkRenderedError = "<OrganizationProfile.Link /> component needs to be a direct child of `<OrganizationProfile />` or `<OrganizationSwitcher />`.";
    var customPagesIgnoredComponent = (componentName) => `<${componentName} /> can only accept <${componentName}.Page /> and <${componentName}.Link /> as its children. Any other provided component will be ignored. Additionally, please ensure that the component is rendered in a client component.`;
    var customPageWrongProps = (componentName) => `Missing props. <${componentName}.Page /> component requires the following props: url, label, labelIcon, alongside with children to be rendered inside the page.`;
    var customLinkWrongProps = (componentName) => `Missing props. <${componentName}.Link /> component requires the following props: url, label and labelIcon.`;
    var userButtonIgnoredComponent = `<UserButton /> can only accept <UserButton.UserProfilePage />, <UserButton.UserProfileLink /> and <UserButton.MenuItems /> as its children. Any other provided component will be ignored. Additionally, please ensure that the component is rendered in a client component.`;
    var customMenuItemsIgnoredComponent = "<UserButton.MenuItems /> component can only accept <UserButton.Action /> and <UserButton.Link /> as its children. Any other provided component will be ignored. Additionally, please ensure that the component is rendered in a client component.";
    var userButtonMenuItemsRenderedError = "<UserButton.MenuItems /> component needs to be a direct child of `<UserButton />`.";
    var userButtonMenuActionRenderedError = "<UserButton.Action /> component needs to be a direct child of `<UserButton.MenuItems />`.";
    var userButtonMenuLinkRenderedError = "<UserButton.Link /> component needs to be a direct child of `<UserButton.MenuItems />`.";
    var userButtonMenuItemLinkWrongProps = "Missing props. <UserButton.Link /> component requires the following props: href, label and labelIcon.";
    var userButtonMenuItemsActionWrongsProps = "Missing props. <UserButton.Action /> component requires the following props: label.";
    var import_react = __toESM(require_react());
    var assertSingleChild = (children) => (name) => {
      try {
        return import_react.default.Children.only(children);
      } catch {
        return errorThrower.throw(multipleChildrenInButtonComponent(name));
      }
    };
    var normalizeWithDefaultValue = (children, defaultText) => {
      if (!children) {
        children = defaultText;
      }
      if (typeof children === "string") {
        children = /* @__PURE__ */ import_react.default.createElement("button", null, children);
      }
      return children;
    };
    var safeExecute = (cb) => (...args) => {
      if (cb && typeof cb === "function") {
        return cb(...args);
      }
    };
    function isConstructor(f) {
      return typeof f === "function";
    }
    var import_react2 = __toESM(require_react());
    var counts = /* @__PURE__ */ new Map();
    function useMaxAllowedInstancesGuard(name, error, maxCount = 1) {
      import_react2.default.useEffect(() => {
        const count = counts.get(name) || 0;
        if (count == maxCount) {
          return errorThrower.throw(error);
        }
        counts.set(name, count + 1);
        return () => {
          counts.set(name, (counts.get(name) || 1) - 1);
        };
      }, []);
    }
    function withMaxAllowedInstancesGuard(WrappedComponent, name, error) {
      const displayName = WrappedComponent.displayName || WrappedComponent.name || name || "Component";
      const Hoc = (props) => {
        useMaxAllowedInstancesGuard(name, error);
        return /* @__PURE__ */ import_react2.default.createElement(WrappedComponent, { ...props });
      };
      Hoc.displayName = `withMaxAllowedInstancesGuard(${displayName})`;
      return Hoc;
    }
    var import_react3 = __toESM(require_react());
    var import_react_dom = require_react_dom();
    var useCustomElementPortal = (elements) => {
      const initialState = Array(elements.length).fill(null);
      const [nodes, setNodes] = (0, import_react3.useState)(initialState);
      return elements.map((el, index) => ({
        id: el.id,
        mount: (node) => setNodes((prevState) => prevState.map((n, i) => i === index ? node : n)),
        unmount: () => setNodes((prevState) => prevState.map((n, i) => i === index ? null : n)),
        portal: () => /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, nodes[index] ? (0, import_react_dom.createPortal)(el.component, nodes[index]) : null)
      }));
    };
    var import_utils = require_utils();
    var import_react5 = __toESM(require_react());
    var import_react4 = __toESM(require_react());
    var isThatComponent = (v, component) => {
      return !!v && import_react4.default.isValidElement(v) && (v == null ? void 0 : v.type) === component;
    };
    var useUserProfileCustomPages = (children, options) => {
      const reorderItemsLabels = ["account", "security"];
      return useCustomPages(
        {
          children,
          reorderItemsLabels,
          LinkComponent: UserProfileLink,
          PageComponent: UserProfilePage,
          MenuItemsComponent: MenuItems,
          componentName: "UserProfile"
        },
        options
      );
    };
    var useOrganizationProfileCustomPages = (children, options) => {
      const reorderItemsLabels = ["general", "members"];
      return useCustomPages(
        {
          children,
          reorderItemsLabels,
          LinkComponent: OrganizationProfileLink,
          PageComponent: OrganizationProfilePage,
          componentName: "OrganizationProfile"
        },
        options
      );
    };
    var useSanitizedChildren = (children) => {
      const sanitizedChildren = [];
      const excludedComponents = [
        OrganizationProfileLink,
        OrganizationProfilePage,
        MenuItems,
        UserProfilePage,
        UserProfileLink
      ];
      import_react5.default.Children.forEach(children, (child) => {
        if (!excludedComponents.some((component) => isThatComponent(child, component))) {
          sanitizedChildren.push(child);
        }
      });
      return sanitizedChildren;
    };
    var useCustomPages = (params, options) => {
      const { children, LinkComponent, PageComponent, MenuItemsComponent, reorderItemsLabels, componentName } = params;
      const { allowForAnyChildren = false } = options || {};
      const validChildren = [];
      import_react5.default.Children.forEach(children, (child) => {
        if (!isThatComponent(child, PageComponent) && !isThatComponent(child, LinkComponent) && !isThatComponent(child, MenuItemsComponent)) {
          if (child && !allowForAnyChildren) {
            (0, import_utils.logErrorInDevMode)(customPagesIgnoredComponent(componentName));
          }
          return;
        }
        const { props } = child;
        const { children: children2, label, url, labelIcon } = props;
        if (isThatComponent(child, PageComponent)) {
          if (isReorderItem(props, reorderItemsLabels)) {
            validChildren.push({ label });
          } else if (isCustomPage(props)) {
            validChildren.push({ label, labelIcon, children: children2, url });
          } else {
            (0, import_utils.logErrorInDevMode)(customPageWrongProps(componentName));
            return;
          }
        }
        if (isThatComponent(child, LinkComponent)) {
          if (isExternalLink(props)) {
            validChildren.push({ label, labelIcon, url });
          } else {
            (0, import_utils.logErrorInDevMode)(customLinkWrongProps(componentName));
            return;
          }
        }
      });
      const customPageContents = [];
      const customPageLabelIcons = [];
      const customLinkLabelIcons = [];
      validChildren.forEach((cp, index) => {
        if (isCustomPage(cp)) {
          customPageContents.push({ component: cp.children, id: index });
          customPageLabelIcons.push({ component: cp.labelIcon, id: index });
          return;
        }
        if (isExternalLink(cp)) {
          customLinkLabelIcons.push({ component: cp.labelIcon, id: index });
        }
      });
      const customPageContentsPortals = useCustomElementPortal(customPageContents);
      const customPageLabelIconsPortals = useCustomElementPortal(customPageLabelIcons);
      const customLinkLabelIconsPortals = useCustomElementPortal(customLinkLabelIcons);
      const customPages = [];
      const customPagesPortals = [];
      validChildren.forEach((cp, index) => {
        if (isReorderItem(cp, reorderItemsLabels)) {
          customPages.push({ label: cp.label });
          return;
        }
        if (isCustomPage(cp)) {
          const {
            portal: contentPortal,
            mount,
            unmount
          } = customPageContentsPortals.find((p) => p.id === index);
          const {
            portal: labelPortal,
            mount: mountIcon,
            unmount: unmountIcon
          } = customPageLabelIconsPortals.find((p) => p.id === index);
          customPages.push({ label: cp.label, url: cp.url, mount, unmount, mountIcon, unmountIcon });
          customPagesPortals.push(contentPortal);
          customPagesPortals.push(labelPortal);
          return;
        }
        if (isExternalLink(cp)) {
          const {
            portal: labelPortal,
            mount: mountIcon,
            unmount: unmountIcon
          } = customLinkLabelIconsPortals.find((p) => p.id === index);
          customPages.push({ label: cp.label, url: cp.url, mountIcon, unmountIcon });
          customPagesPortals.push(labelPortal);
          return;
        }
      });
      return { customPages, customPagesPortals };
    };
    var isReorderItem = (childProps, validItems) => {
      const { children, label, url, labelIcon } = childProps;
      return !children && !url && !labelIcon && validItems.some((v) => v === label);
    };
    var isCustomPage = (childProps) => {
      const { children, label, url, labelIcon } = childProps;
      return !!children && !!url && !!labelIcon && !!label;
    };
    var isExternalLink = (childProps) => {
      const { children, label, url, labelIcon } = childProps;
      return !children && !!url && !!labelIcon && !!label;
    };
    var import_utils2 = require_utils();
    var import_react6 = __toESM(require_react());
    var useUserButtonCustomMenuItems = (children) => {
      const reorderItemsLabels = ["manageAccount", "signOut"];
      return useCustomMenuItems({
        children,
        reorderItemsLabels,
        MenuItemsComponent: MenuItems,
        MenuActionComponent: MenuAction,
        MenuLinkComponent: MenuLink,
        UserProfileLinkComponent: UserProfileLink,
        UserProfilePageComponent: UserProfilePage
      });
    };
    var useCustomMenuItems = ({
      children,
      MenuItemsComponent,
      MenuActionComponent,
      MenuLinkComponent,
      UserProfileLinkComponent,
      UserProfilePageComponent,
      reorderItemsLabels
    }) => {
      const validChildren = [];
      const customMenuItems = [];
      const customMenuItemsPortals = [];
      import_react6.default.Children.forEach(children, (child) => {
        if (!isThatComponent(child, MenuItemsComponent) && !isThatComponent(child, UserProfileLinkComponent) && !isThatComponent(child, UserProfilePageComponent)) {
          if (child) {
            (0, import_utils2.logErrorInDevMode)(userButtonIgnoredComponent);
          }
          return;
        }
        if (isThatComponent(child, UserProfileLinkComponent) || isThatComponent(child, UserProfilePageComponent)) {
          return;
        }
        const { props } = child;
        import_react6.default.Children.forEach(props.children, (child2) => {
          if (!isThatComponent(child2, MenuActionComponent) && !isThatComponent(child2, MenuLinkComponent)) {
            if (child2) {
              (0, import_utils2.logErrorInDevMode)(customMenuItemsIgnoredComponent);
            }
            return;
          }
          const { props: props2 } = child2;
          const { label, labelIcon, href, onClick, open } = props2;
          if (isThatComponent(child2, MenuActionComponent)) {
            if (isReorderItem2(props2, reorderItemsLabels)) {
              validChildren.push({ label });
            } else if (isCustomMenuItem(props2)) {
              const baseItem = {
                label,
                labelIcon
              };
              if (onClick !== void 0) {
                validChildren.push({
                  ...baseItem,
                  onClick
                });
              } else if (open !== void 0) {
                validChildren.push({
                  ...baseItem,
                  open: open.startsWith("/") ? open : `/${open}`
                });
              } else {
                (0, import_utils2.logErrorInDevMode)("Custom menu item must have either onClick or open property");
                return;
              }
            } else {
              (0, import_utils2.logErrorInDevMode)(userButtonMenuItemsActionWrongsProps);
              return;
            }
          }
          if (isThatComponent(child2, MenuLinkComponent)) {
            if (isExternalLink2(props2)) {
              validChildren.push({ label, labelIcon, href });
            } else {
              (0, import_utils2.logErrorInDevMode)(userButtonMenuItemLinkWrongProps);
              return;
            }
          }
        });
      });
      const customMenuItemLabelIcons = [];
      const customLinkLabelIcons = [];
      validChildren.forEach((mi, index) => {
        if (isCustomMenuItem(mi)) {
          customMenuItemLabelIcons.push({ component: mi.labelIcon, id: index });
        }
        if (isExternalLink2(mi)) {
          customLinkLabelIcons.push({ component: mi.labelIcon, id: index });
        }
      });
      const customMenuItemLabelIconsPortals = useCustomElementPortal(customMenuItemLabelIcons);
      const customLinkLabelIconsPortals = useCustomElementPortal(customLinkLabelIcons);
      validChildren.forEach((mi, index) => {
        if (isReorderItem2(mi, reorderItemsLabels)) {
          customMenuItems.push({
            label: mi.label
          });
        }
        if (isCustomMenuItem(mi)) {
          const {
            portal: iconPortal,
            mount: mountIcon,
            unmount: unmountIcon
          } = customMenuItemLabelIconsPortals.find((p) => p.id === index);
          const menuItem = {
            label: mi.label,
            mountIcon,
            unmountIcon
          };
          if ("onClick" in mi) {
            menuItem.onClick = mi.onClick;
          } else if ("open" in mi) {
            menuItem.open = mi.open;
          }
          customMenuItems.push(menuItem);
          customMenuItemsPortals.push(iconPortal);
        }
        if (isExternalLink2(mi)) {
          const {
            portal: iconPortal,
            mount: mountIcon,
            unmount: unmountIcon
          } = customLinkLabelIconsPortals.find((p) => p.id === index);
          customMenuItems.push({
            label: mi.label,
            href: mi.href,
            mountIcon,
            unmountIcon
          });
          customMenuItemsPortals.push(iconPortal);
        }
      });
      return { customMenuItems, customMenuItemsPortals };
    };
    var isReorderItem2 = (childProps, validItems) => {
      const { children, label, onClick, labelIcon } = childProps;
      return !children && !onClick && !labelIcon && validItems.some((v) => v === label);
    };
    var isCustomMenuItem = (childProps) => {
      const { label, labelIcon, onClick, open } = childProps;
      return !!labelIcon && !!label && (typeof onClick === "function" || typeof open === "string");
    };
    var isExternalLink2 = (childProps) => {
      const { label, href, labelIcon } = childProps;
      return !!href && !!labelIcon && !!label;
    };
    var import_react7 = require_react();
    function waitForElementChildren(options) {
      const { root = document == null ? void 0 : document.body, selector, timeout = 0 } = options;
      return new Promise((resolve, reject) => {
        if (!root) {
          reject(new Error("No root element provided"));
          return;
        }
        let elementToWatch = root;
        if (selector) {
          elementToWatch = root == null ? void 0 : root.querySelector(selector);
        }
        const isElementAlreadyPresent = (elementToWatch == null ? void 0 : elementToWatch.childElementCount) && elementToWatch.childElementCount > 0;
        if (isElementAlreadyPresent) {
          resolve();
          return;
        }
        const observer = new MutationObserver((mutationsList) => {
          for (const mutation of mutationsList) {
            if (mutation.type === "childList") {
              if (!elementToWatch && selector) {
                elementToWatch = root == null ? void 0 : root.querySelector(selector);
              }
              if ((elementToWatch == null ? void 0 : elementToWatch.childElementCount) && elementToWatch.childElementCount > 0) {
                observer.disconnect();
                resolve();
                return;
              }
            }
          }
        });
        observer.observe(root, { childList: true, subtree: true });
        if (timeout > 0) {
          setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Timeout waiting for element children`));
          }, timeout);
        }
      });
    }
    function useWaitForComponentMount(component) {
      const watcherRef = (0, import_react7.useRef)();
      const [status, setStatus] = (0, import_react7.useState)("rendering");
      (0, import_react7.useEffect)(() => {
        if (!component) {
          throw new Error("Clerk: no component name provided, unable to detect mount.");
        }
        if (typeof window !== "undefined" && !watcherRef.current) {
          watcherRef.current = waitForElementChildren({ selector: `[data-clerk-component="${component}"]` }).then(() => {
            setStatus("rendered");
          }).catch(() => {
            setStatus("error");
          });
        }
      }, [component]);
      return status;
    }
    var import_object = require_object();
    var import_react8 = require_react2();
    var import_react9 = __toESM(require_react());
    var isMountProps = (props) => {
      return "mount" in props;
    };
    var isOpenProps = (props) => {
      return "open" in props;
    };
    var stripMenuItemIconHandlers = (menuItems) => {
      return menuItems == null ? void 0 : menuItems.map(({ mountIcon, unmountIcon, ...rest }) => rest);
    };
    var ClerkHostRenderer = class extends import_react9.default.PureComponent {
      constructor() {
        super(...arguments);
        this.rootRef = import_react9.default.createRef();
      }
      componentDidUpdate(_prevProps) {
        var _a, _b, _c, _d;
        if (!isMountProps(_prevProps) || !isMountProps(this.props)) {
          return;
        }
        const prevProps = (0, import_object.without)(_prevProps.props, "customPages", "customMenuItems", "children");
        const newProps = (0, import_object.without)(this.props.props, "customPages", "customMenuItems", "children");
        const customPagesChanged = ((_a = prevProps.customPages) == null ? void 0 : _a.length) !== ((_b = newProps.customPages) == null ? void 0 : _b.length);
        const customMenuItemsChanged = ((_c = prevProps.customMenuItems) == null ? void 0 : _c.length) !== ((_d = newProps.customMenuItems) == null ? void 0 : _d.length);
        const prevMenuItemsWithoutHandlers = stripMenuItemIconHandlers(_prevProps.props.customMenuItems);
        const newMenuItemsWithoutHandlers = stripMenuItemIconHandlers(this.props.props.customMenuItems);
        if (!(0, import_react8.isDeeplyEqual)(prevProps, newProps) || !(0, import_react8.isDeeplyEqual)(prevMenuItemsWithoutHandlers, newMenuItemsWithoutHandlers) || customPagesChanged || customMenuItemsChanged) {
          if (this.rootRef.current) {
            this.props.updateProps({ node: this.rootRef.current, props: this.props.props });
          }
        }
      }
      componentDidMount() {
        if (this.rootRef.current) {
          if (isMountProps(this.props)) {
            this.props.mount(this.rootRef.current, this.props.props);
          }
          if (isOpenProps(this.props)) {
            this.props.open(this.props.props);
          }
        }
      }
      componentWillUnmount() {
        if (this.rootRef.current) {
          if (isMountProps(this.props)) {
            this.props.unmount(this.rootRef.current);
          }
          if (isOpenProps(this.props)) {
            this.props.close();
          }
        }
      }
      render() {
        const { hideRootHtmlElement = false } = this.props;
        const rootAttributes = {
          ref: this.rootRef,
          ...this.props.rootProps,
          ...this.props.component && { "data-clerk-component": this.props.component }
        };
        return /* @__PURE__ */ import_react9.default.createElement(import_react9.default.Fragment, null, !hideRootHtmlElement && /* @__PURE__ */ import_react9.default.createElement("div", { ...rootAttributes }), this.props.children);
      }
    };
    var import_react12 = __toESM(require_react());
    var import_react10 = require_react2();
    var IsomorphicClerkContext = import_react10.ClerkInstanceContext;
    var useIsomorphicClerkContext = import_react10.useClerkInstanceContext;
    var import_react11 = require_react2();
    var useAssertWrappedByClerkProvider = (source) => {
      (0, import_react11.useAssertWrappedByClerkProvider)(() => {
        errorThrower.throwMissingClerkProviderError({ source });
      });
    };
    var withClerk = (Component, displayNameOrOptions) => {
      const passedDisplayedName = typeof displayNameOrOptions === "string" ? displayNameOrOptions : displayNameOrOptions == null ? void 0 : displayNameOrOptions.component;
      const displayName = passedDisplayedName || Component.displayName || Component.name || "Component";
      Component.displayName = displayName;
      const options = typeof displayNameOrOptions === "string" ? void 0 : displayNameOrOptions;
      const HOC = (props) => {
        useAssertWrappedByClerkProvider(displayName || "withClerk");
        const clerk = useIsomorphicClerkContext();
        if (!clerk.loaded && !(options == null ? void 0 : options.renderWhileLoading)) {
          return null;
        }
        return /* @__PURE__ */ import_react12.default.createElement(
          Component,
          {
            ...props,
            component: displayName,
            clerk
          }
        );
      };
      HOC.displayName = `withClerk(${displayName})`;
      return HOC;
    };
    var CustomPortalsRenderer = (props) => {
      var _a, _b;
      return /* @__PURE__ */ import_react13.default.createElement(import_react13.default.Fragment, null, (_a = props == null ? void 0 : props.customPagesPortals) == null ? void 0 : _a.map((portal, index) => (0, import_react13.createElement)(portal, { key: index })), (_b = props == null ? void 0 : props.customMenuItemsPortals) == null ? void 0 : _b.map((portal, index) => (0, import_react13.createElement)(portal, { key: index })));
    };
    var SignIn2 = withClerk(
      ({ clerk, component, fallback, ...props }) => {
        const mountingStatus = useWaitForComponentMount(component);
        const shouldShowFallback = mountingStatus === "rendering" || !clerk.loaded;
        const rendererRootProps = {
          ...shouldShowFallback && fallback && { style: { display: "none" } }
        };
        return /* @__PURE__ */ import_react13.default.createElement(import_react13.default.Fragment, null, shouldShowFallback && fallback, clerk.loaded && /* @__PURE__ */ import_react13.default.createElement(
          ClerkHostRenderer,
          {
            component,
            mount: clerk.mountSignIn,
            unmount: clerk.unmountSignIn,
            updateProps: clerk.__unstable__updateProps,
            props,
            rootProps: rendererRootProps
          }
        ));
      },
      { component: "SignIn", renderWhileLoading: true }
    );
    var SignUp2 = withClerk(
      ({ clerk, component, fallback, ...props }) => {
        const mountingStatus = useWaitForComponentMount(component);
        const shouldShowFallback = mountingStatus === "rendering" || !clerk.loaded;
        const rendererRootProps = {
          ...shouldShowFallback && fallback && { style: { display: "none" } }
        };
        return /* @__PURE__ */ import_react13.default.createElement(import_react13.default.Fragment, null, shouldShowFallback && fallback, clerk.loaded && /* @__PURE__ */ import_react13.default.createElement(
          ClerkHostRenderer,
          {
            component,
            mount: clerk.mountSignUp,
            unmount: clerk.unmountSignUp,
            updateProps: clerk.__unstable__updateProps,
            props,
            rootProps: rendererRootProps
          }
        ));
      },
      { component: "SignUp", renderWhileLoading: true }
    );
    function UserProfilePage({ children }) {
      (0, import_utils3.logErrorInDevMode)(userProfilePageRenderedError);
      return /* @__PURE__ */ import_react13.default.createElement(import_react13.default.Fragment, null, children);
    }
    function UserProfileLink({ children }) {
      (0, import_utils3.logErrorInDevMode)(userProfileLinkRenderedError);
      return /* @__PURE__ */ import_react13.default.createElement(import_react13.default.Fragment, null, children);
    }
    var _UserProfile = withClerk(
      ({
        clerk,
        component,
        fallback,
        ...props
      }) => {
        const mountingStatus = useWaitForComponentMount(component);
        const shouldShowFallback = mountingStatus === "rendering" || !clerk.loaded;
        const rendererRootProps = {
          ...shouldShowFallback && fallback && { style: { display: "none" } }
        };
        const { customPages, customPagesPortals } = useUserProfileCustomPages(props.children);
        return /* @__PURE__ */ import_react13.default.createElement(import_react13.default.Fragment, null, shouldShowFallback && fallback, /* @__PURE__ */ import_react13.default.createElement(
          ClerkHostRenderer,
          {
            component,
            mount: clerk.mountUserProfile,
            unmount: clerk.unmountUserProfile,
            updateProps: clerk.__unstable__updateProps,
            props: { ...props, customPages },
            rootProps: rendererRootProps
          },
          /* @__PURE__ */ import_react13.default.createElement(CustomPortalsRenderer, { customPagesPortals })
        ));
      },
      { component: "UserProfile", renderWhileLoading: true }
    );
    var UserProfile2 = Object.assign(_UserProfile, {
      Page: UserProfilePage,
      Link: UserProfileLink
    });
    var UserButtonContext = (0, import_react13.createContext)({
      mount: () => {
      },
      unmount: () => {
      },
      updateProps: () => {
      }
    });
    var _UserButton = withClerk(
      ({
        clerk,
        component,
        fallback,
        ...props
      }) => {
        const mountingStatus = useWaitForComponentMount(component);
        const shouldShowFallback = mountingStatus === "rendering" || !clerk.loaded;
        const rendererRootProps = {
          ...shouldShowFallback && fallback && { style: { display: "none" } }
        };
        const { customPages, customPagesPortals } = useUserProfileCustomPages(props.children, {
          allowForAnyChildren: !!props.__experimental_asProvider
        });
        const userProfileProps = Object.assign(props.userProfileProps || {}, { customPages });
        const { customMenuItems, customMenuItemsPortals } = useUserButtonCustomMenuItems(props.children);
        const sanitizedChildren = useSanitizedChildren(props.children);
        const passableProps = {
          mount: clerk.mountUserButton,
          unmount: clerk.unmountUserButton,
          updateProps: clerk.__unstable__updateProps,
          props: { ...props, userProfileProps, customMenuItems }
        };
        const portalProps = {
          customPagesPortals,
          customMenuItemsPortals
        };
        return /* @__PURE__ */ import_react13.default.createElement(UserButtonContext.Provider, { value: passableProps }, shouldShowFallback && fallback, clerk.loaded && /* @__PURE__ */ import_react13.default.createElement(
          ClerkHostRenderer,
          {
            component,
            ...passableProps,
            hideRootHtmlElement: !!props.__experimental_asProvider,
            rootProps: rendererRootProps
          },
          props.__experimental_asProvider ? sanitizedChildren : null,
          /* @__PURE__ */ import_react13.default.createElement(CustomPortalsRenderer, { ...portalProps })
        ));
      },
      { component: "UserButton", renderWhileLoading: true }
    );
    function MenuItems({ children }) {
      (0, import_utils3.logErrorInDevMode)(userButtonMenuItemsRenderedError);
      return /* @__PURE__ */ import_react13.default.createElement(import_react13.default.Fragment, null, children);
    }
    function MenuAction({ children }) {
      (0, import_utils3.logErrorInDevMode)(userButtonMenuActionRenderedError);
      return /* @__PURE__ */ import_react13.default.createElement(import_react13.default.Fragment, null, children);
    }
    function MenuLink({ children }) {
      (0, import_utils3.logErrorInDevMode)(userButtonMenuLinkRenderedError);
      return /* @__PURE__ */ import_react13.default.createElement(import_react13.default.Fragment, null, children);
    }
    function UserButtonOutlet(outletProps) {
      const providerProps = (0, import_react13.useContext)(UserButtonContext);
      const portalProps = {
        ...providerProps,
        props: {
          ...providerProps.props,
          ...outletProps
        }
      };
      return /* @__PURE__ */ import_react13.default.createElement(ClerkHostRenderer, { ...portalProps });
    }
    var UserButton = Object.assign(_UserButton, {
      UserProfilePage,
      UserProfileLink,
      MenuItems,
      Action: MenuAction,
      Link: MenuLink,
      __experimental_Outlet: UserButtonOutlet
    });
    function OrganizationProfilePage({ children }) {
      (0, import_utils3.logErrorInDevMode)(organizationProfilePageRenderedError);
      return /* @__PURE__ */ import_react13.default.createElement(import_react13.default.Fragment, null, children);
    }
    function OrganizationProfileLink({ children }) {
      (0, import_utils3.logErrorInDevMode)(organizationProfileLinkRenderedError);
      return /* @__PURE__ */ import_react13.default.createElement(import_react13.default.Fragment, null, children);
    }
    var _OrganizationProfile = withClerk(
      ({
        clerk,
        component,
        fallback,
        ...props
      }) => {
        const mountingStatus = useWaitForComponentMount(component);
        const shouldShowFallback = mountingStatus === "rendering" || !clerk.loaded;
        const rendererRootProps = {
          ...shouldShowFallback && fallback && { style: { display: "none" } }
        };
        const { customPages, customPagesPortals } = useOrganizationProfileCustomPages(props.children);
        return /* @__PURE__ */ import_react13.default.createElement(import_react13.default.Fragment, null, shouldShowFallback && fallback, clerk.loaded && /* @__PURE__ */ import_react13.default.createElement(
          ClerkHostRenderer,
          {
            component,
            mount: clerk.mountOrganizationProfile,
            unmount: clerk.unmountOrganizationProfile,
            updateProps: clerk.__unstable__updateProps,
            props: { ...props, customPages },
            rootProps: rendererRootProps
          },
          /* @__PURE__ */ import_react13.default.createElement(CustomPortalsRenderer, { customPagesPortals })
        ));
      },
      { component: "OrganizationProfile", renderWhileLoading: true }
    );
    var OrganizationProfile2 = Object.assign(_OrganizationProfile, {
      Page: OrganizationProfilePage,
      Link: OrganizationProfileLink
    });
    var CreateOrganization = withClerk(
      ({ clerk, component, fallback, ...props }) => {
        const mountingStatus = useWaitForComponentMount(component);
        const shouldShowFallback = mountingStatus === "rendering" || !clerk.loaded;
        const rendererRootProps = {
          ...shouldShowFallback && fallback && { style: { display: "none" } }
        };
        return /* @__PURE__ */ import_react13.default.createElement(import_react13.default.Fragment, null, shouldShowFallback && fallback, clerk.loaded && /* @__PURE__ */ import_react13.default.createElement(
          ClerkHostRenderer,
          {
            component,
            mount: clerk.mountCreateOrganization,
            unmount: clerk.unmountCreateOrganization,
            updateProps: clerk.__unstable__updateProps,
            props,
            rootProps: rendererRootProps
          }
        ));
      },
      { component: "CreateOrganization", renderWhileLoading: true }
    );
    var OrganizationSwitcherContext = (0, import_react13.createContext)({
      mount: () => {
      },
      unmount: () => {
      },
      updateProps: () => {
      }
    });
    var _OrganizationSwitcher = withClerk(
      ({
        clerk,
        component,
        fallback,
        ...props
      }) => {
        const mountingStatus = useWaitForComponentMount(component);
        const shouldShowFallback = mountingStatus === "rendering" || !clerk.loaded;
        const rendererRootProps = {
          ...shouldShowFallback && fallback && { style: { display: "none" } }
        };
        const { customPages, customPagesPortals } = useOrganizationProfileCustomPages(props.children, {
          allowForAnyChildren: !!props.__experimental_asProvider
        });
        const organizationProfileProps = Object.assign(props.organizationProfileProps || {}, { customPages });
        const sanitizedChildren = useSanitizedChildren(props.children);
        const passableProps = {
          mount: clerk.mountOrganizationSwitcher,
          unmount: clerk.unmountOrganizationSwitcher,
          updateProps: clerk.__unstable__updateProps,
          props: { ...props, organizationProfileProps },
          rootProps: rendererRootProps,
          component
        };
        clerk.__experimental_prefetchOrganizationSwitcher();
        return /* @__PURE__ */ import_react13.default.createElement(OrganizationSwitcherContext.Provider, { value: passableProps }, /* @__PURE__ */ import_react13.default.createElement(import_react13.default.Fragment, null, shouldShowFallback && fallback, clerk.loaded && /* @__PURE__ */ import_react13.default.createElement(
          ClerkHostRenderer,
          {
            ...passableProps,
            hideRootHtmlElement: !!props.__experimental_asProvider
          },
          props.__experimental_asProvider ? sanitizedChildren : null,
          /* @__PURE__ */ import_react13.default.createElement(CustomPortalsRenderer, { customPagesPortals })
        )));
      },
      { component: "OrganizationSwitcher", renderWhileLoading: true }
    );
    function OrganizationSwitcherOutlet(outletProps) {
      const providerProps = (0, import_react13.useContext)(OrganizationSwitcherContext);
      const portalProps = {
        ...providerProps,
        props: {
          ...providerProps.props,
          ...outletProps
        }
      };
      return /* @__PURE__ */ import_react13.default.createElement(ClerkHostRenderer, { ...portalProps });
    }
    var OrganizationSwitcher = Object.assign(_OrganizationSwitcher, {
      OrganizationProfilePage,
      OrganizationProfileLink,
      __experimental_Outlet: OrganizationSwitcherOutlet
    });
    var OrganizationList = withClerk(
      ({ clerk, component, fallback, ...props }) => {
        const mountingStatus = useWaitForComponentMount(component);
        const shouldShowFallback = mountingStatus === "rendering" || !clerk.loaded;
        const rendererRootProps = {
          ...shouldShowFallback && fallback && { style: { display: "none" } }
        };
        return /* @__PURE__ */ import_react13.default.createElement(import_react13.default.Fragment, null, shouldShowFallback && fallback, clerk.loaded && /* @__PURE__ */ import_react13.default.createElement(
          ClerkHostRenderer,
          {
            component,
            mount: clerk.mountOrganizationList,
            unmount: clerk.unmountOrganizationList,
            updateProps: clerk.__unstable__updateProps,
            props,
            rootProps: rendererRootProps
          }
        ));
      },
      { component: "OrganizationList", renderWhileLoading: true }
    );
    var GoogleOneTap = withClerk(
      ({ clerk, component, fallback, ...props }) => {
        const mountingStatus = useWaitForComponentMount(component);
        const shouldShowFallback = mountingStatus === "rendering" || !clerk.loaded;
        const rendererRootProps = {
          ...shouldShowFallback && fallback && { style: { display: "none" } }
        };
        return /* @__PURE__ */ import_react13.default.createElement(import_react13.default.Fragment, null, shouldShowFallback && fallback, clerk.loaded && /* @__PURE__ */ import_react13.default.createElement(
          ClerkHostRenderer,
          {
            component,
            open: clerk.openGoogleOneTap,
            close: clerk.closeGoogleOneTap,
            updateProps: clerk.__unstable__updateProps,
            props,
            rootProps: rendererRootProps
          }
        ));
      },
      { component: "GoogleOneTap", renderWhileLoading: true }
    );
    var Waitlist = withClerk(
      ({ clerk, component, fallback, ...props }) => {
        const mountingStatus = useWaitForComponentMount(component);
        const shouldShowFallback = mountingStatus === "rendering" || !clerk.loaded;
        const rendererRootProps = {
          ...shouldShowFallback && fallback && { style: { display: "none" } }
        };
        return /* @__PURE__ */ import_react13.default.createElement(import_react13.default.Fragment, null, shouldShowFallback && fallback, clerk.loaded && /* @__PURE__ */ import_react13.default.createElement(
          ClerkHostRenderer,
          {
            component,
            mount: clerk.mountWaitlist,
            unmount: clerk.unmountWaitlist,
            updateProps: clerk.__unstable__updateProps,
            props,
            rootProps: rendererRootProps
          }
        ));
      },
      { component: "Waitlist", renderWhileLoading: true }
    );
    var __experimental_PricingTable = withClerk(
      ({ clerk, component, fallback, ...props }) => {
        const mountingStatus = useWaitForComponentMount(component);
        const shouldShowFallback = mountingStatus === "rendering" || !clerk.loaded;
        const rendererRootProps = {
          ...shouldShowFallback && fallback && { style: { display: "none" } }
        };
        return /* @__PURE__ */ import_react13.default.createElement(import_react13.default.Fragment, null, shouldShowFallback && fallback, clerk.loaded && /* @__PURE__ */ import_react13.default.createElement(
          ClerkHostRenderer,
          {
            component,
            mount: clerk.__experimental_mountPricingTable,
            unmount: clerk.__experimental_unmountPricingTable,
            updateProps: clerk.__unstable__updateProps,
            props,
            rootProps: rendererRootProps
          }
        ));
      },
      { component: "__experimental_PricingTable", renderWhileLoading: true }
    );
    var import_deprecated = require_deprecated();
    var import_react21 = __toESM(require_react());
    var import_react14 = require_react2();
    var import_authorization = require_authorization();
    var import_telemetry = require_telemetry();
    var import_react16 = require_react();
    var import_react15 = require_react2();
    var [AuthContext, useAuthContext] = (0, import_react15.createContextAndHook)("AuthContext");
    var clerkLoaded = (isomorphicClerk) => {
      return new Promise((resolve) => {
        const handler = (status) => {
          if (["ready", "degraded"].includes(status)) {
            resolve();
            isomorphicClerk.off("status", handler);
          }
        };
        isomorphicClerk.on("status", handler, { notify: true });
      });
    };
    var createGetToken = (isomorphicClerk) => {
      return async (options) => {
        await clerkLoaded(isomorphicClerk);
        if (!isomorphicClerk.session) {
          return null;
        }
        return isomorphicClerk.session.getToken(options);
      };
    };
    var createSignOut = (isomorphicClerk) => {
      return async (...args) => {
        await clerkLoaded(isomorphicClerk);
        return isomorphicClerk.signOut(...args);
      };
    };
    var useAuth = (initialAuthStateOrOptions = {}) => {
      var _a, _b;
      useAssertWrappedByClerkProvider("useAuth");
      const { treatPendingAsSignedOut, ...rest } = initialAuthStateOrOptions != null ? initialAuthStateOrOptions : {};
      const initialAuthState = rest;
      const authContextFromHook = useAuthContext();
      let authContext = authContextFromHook;
      if (authContext.sessionId === void 0 && authContext.userId === void 0) {
        authContext = initialAuthState != null ? initialAuthState : {};
      }
      const isomorphicClerk = useIsomorphicClerkContext();
      const getToken = (0, import_react16.useCallback)(createGetToken(isomorphicClerk), [isomorphicClerk]);
      const signOut = (0, import_react16.useCallback)(createSignOut(isomorphicClerk), [isomorphicClerk]);
      (_a = isomorphicClerk.telemetry) == null ? void 0 : _a.record((0, import_telemetry.eventMethodCalled)("useAuth", { treatPendingAsSignedOut }));
      return useDerivedAuth(
        {
          ...authContext,
          getToken,
          signOut
        },
        {
          treatPendingAsSignedOut: treatPendingAsSignedOut != null ? treatPendingAsSignedOut : (_b = isomorphicClerk.__internal_getOption) == null ? void 0 : _b.call(isomorphicClerk, "treatPendingAsSignedOut")
        }
      );
    };
    function useDerivedAuth(authObject, { treatPendingAsSignedOut = true } = {}) {
      const { userId, orgId, orgRole, has, signOut, getToken, orgPermissions, factorVerificationAge, sessionClaims } = authObject != null ? authObject : {};
      const derivedHas = (0, import_react16.useCallback)(
        (params) => {
          if (has) {
            return has(params);
          }
          return (0, import_authorization.createCheckAuthorization)({
            userId,
            orgId,
            orgRole,
            orgPermissions,
            factorVerificationAge,
            features: (sessionClaims == null ? void 0 : sessionClaims.fea) || "",
            plans: (sessionClaims == null ? void 0 : sessionClaims.pla) || ""
          })(params);
        },
        [has, userId, orgId, orgRole, orgPermissions, factorVerificationAge]
      );
      const payload = (0, import_authorization.resolveAuthState)({
        authObject: {
          ...authObject,
          getToken,
          signOut,
          has: derivedHas
        },
        options: {
          treatPendingAsSignedOut
        }
      });
      if (!payload) {
        return errorThrower.throw(invalidStateError);
      }
      return payload;
    }
    var import_react17 = __toESM(require_react());
    function useEmailLink(resource) {
      const { startEmailLinkFlow, cancelEmailLinkFlow } = import_react17.default.useMemo(() => resource.createEmailLinkFlow(), [resource]);
      import_react17.default.useEffect(() => {
        return cancelEmailLinkFlow;
      }, []);
      return {
        startEmailLinkFlow,
        cancelEmailLinkFlow
      };
    }
    var import_react18 = require_react2();
    var import_telemetry2 = require_telemetry();
    var useSignIn = () => {
      var _a;
      useAssertWrappedByClerkProvider("useSignIn");
      const isomorphicClerk = useIsomorphicClerkContext();
      const client = (0, import_react18.useClientContext)();
      (_a = isomorphicClerk.telemetry) == null ? void 0 : _a.record((0, import_telemetry2.eventMethodCalled)("useSignIn"));
      if (!client) {
        return { isLoaded: false, signIn: void 0, setActive: void 0 };
      }
      return {
        isLoaded: true,
        signIn: client.signIn,
        setActive: isomorphicClerk.setActive
      };
    };
    var import_react19 = require_react2();
    var import_telemetry3 = require_telemetry();
    var useSignUp = () => {
      var _a;
      useAssertWrappedByClerkProvider("useSignUp");
      const isomorphicClerk = useIsomorphicClerkContext();
      const client = (0, import_react19.useClientContext)();
      (_a = isomorphicClerk.telemetry) == null ? void 0 : _a.record((0, import_telemetry3.eventMethodCalled)("useSignUp"));
      if (!client) {
        return { isLoaded: false, signUp: void 0, setActive: void 0 };
      }
      return {
        isLoaded: true,
        signUp: client.signUp,
        setActive: isomorphicClerk.setActive
      };
    };
    var import_react20 = require_react2();
    var SignedIn = ({ children, treatPendingAsSignedOut }) => {
      useAssertWrappedByClerkProvider("SignedIn");
      const { userId } = useAuth({ treatPendingAsSignedOut });
      if (userId) {
        return children;
      }
      return null;
    };
    var SignedOut = ({ children, treatPendingAsSignedOut }) => {
      useAssertWrappedByClerkProvider("SignedOut");
      const { userId } = useAuth({ treatPendingAsSignedOut });
      if (userId === null) {
        return children;
      }
      return null;
    };
    var ClerkLoaded = ({ children }) => {
      useAssertWrappedByClerkProvider("ClerkLoaded");
      const isomorphicClerk = useIsomorphicClerkContext();
      if (!isomorphicClerk.loaded) {
        return null;
      }
      return children;
    };
    var ClerkLoading = ({ children }) => {
      useAssertWrappedByClerkProvider("ClerkLoading");
      const isomorphicClerk = useIsomorphicClerkContext();
      if (isomorphicClerk.status !== "loading") {
        return null;
      }
      return children;
    };
    var ClerkFailed = ({ children }) => {
      useAssertWrappedByClerkProvider("ClerkFailed");
      const isomorphicClerk = useIsomorphicClerkContext();
      if (isomorphicClerk.status !== "error") {
        return null;
      }
      return children;
    };
    var ClerkDegraded = ({ children }) => {
      useAssertWrappedByClerkProvider("ClerkDegraded");
      const isomorphicClerk = useIsomorphicClerkContext();
      if (isomorphicClerk.status !== "degraded") {
        return null;
      }
      return children;
    };
    var Protect = ({ children, fallback, treatPendingAsSignedOut, ...restAuthorizedParams }) => {
      useAssertWrappedByClerkProvider("Protect");
      const { isLoaded, has, userId } = useAuth({ treatPendingAsSignedOut });
      if (!isLoaded) {
        return null;
      }
      const unauthorized = fallback != null ? fallback : null;
      const authorized = children;
      if (!userId) {
        return unauthorized;
      }
      if (typeof restAuthorizedParams.condition === "function") {
        if (restAuthorizedParams.condition(has)) {
          return authorized;
        }
        return unauthorized;
      }
      if (restAuthorizedParams.role || restAuthorizedParams.permission || restAuthorizedParams.feature || restAuthorizedParams.plan) {
        if (has(restAuthorizedParams)) {
          return authorized;
        }
        return unauthorized;
      }
      return authorized;
    };
    var RedirectToSignIn = withClerk(({ clerk, ...props }) => {
      const { client, session } = clerk;
      const hasSignedInSessions = client.signedInSessions ? client.signedInSessions.length > 0 : (
        // Compat for clerk-js<5.54.0 (which was released with the `signedInSessions` property)
        client.activeSessions && client.activeSessions.length > 0
      );
      import_react21.default.useEffect(() => {
        if (session === null && hasSignedInSessions) {
          void clerk.redirectToAfterSignOut();
        } else {
          void clerk.redirectToSignIn(props);
        }
      }, []);
      return null;
    }, "RedirectToSignIn");
    var RedirectToSignUp = withClerk(({ clerk, ...props }) => {
      import_react21.default.useEffect(() => {
        void clerk.redirectToSignUp(props);
      }, []);
      return null;
    }, "RedirectToSignUp");
    var RedirectToUserProfile = withClerk(({ clerk }) => {
      import_react21.default.useEffect(() => {
        (0, import_deprecated.deprecated)("RedirectToUserProfile", "Use the `redirectToUserProfile()` method instead.");
        void clerk.redirectToUserProfile();
      }, []);
      return null;
    }, "RedirectToUserProfile");
    var RedirectToOrganizationProfile = withClerk(({ clerk }) => {
      import_react21.default.useEffect(() => {
        (0, import_deprecated.deprecated)("RedirectToOrganizationProfile", "Use the `redirectToOrganizationProfile()` method instead.");
        void clerk.redirectToOrganizationProfile();
      }, []);
      return null;
    }, "RedirectToOrganizationProfile");
    var RedirectToCreateOrganization = withClerk(({ clerk }) => {
      import_react21.default.useEffect(() => {
        (0, import_deprecated.deprecated)("RedirectToCreateOrganization", "Use the `redirectToCreateOrganization()` method instead.");
        void clerk.redirectToCreateOrganization();
      }, []);
      return null;
    }, "RedirectToCreateOrganization");
    var AuthenticateWithRedirectCallback = withClerk(
      ({ clerk, ...handleRedirectCallbackParams }) => {
        import_react21.default.useEffect(() => {
          void clerk.handleRedirectCallback(handleRedirectCallbackParams);
        }, []);
        return null;
      },
      "AuthenticateWithRedirectCallback"
    );
    var import_react22 = __toESM(require_react());
    var SignInButton = withClerk(
      ({ clerk, children, ...props }) => {
        const {
          signUpFallbackRedirectUrl,
          forceRedirectUrl,
          fallbackRedirectUrl,
          signUpForceRedirectUrl,
          mode,
          initialValues,
          withSignUp,
          oauthFlow,
          ...rest
        } = props;
        children = normalizeWithDefaultValue(children, "Sign in");
        const child = assertSingleChild(children)("SignInButton");
        const clickHandler = () => {
          const opts = {
            forceRedirectUrl,
            fallbackRedirectUrl,
            signUpFallbackRedirectUrl,
            signUpForceRedirectUrl,
            initialValues,
            withSignUp,
            oauthFlow
          };
          if (mode === "modal") {
            return clerk.openSignIn({ ...opts, appearance: props.appearance });
          }
          return clerk.redirectToSignIn({
            ...opts,
            signInFallbackRedirectUrl: fallbackRedirectUrl,
            signInForceRedirectUrl: forceRedirectUrl
          });
        };
        const wrappedChildClickHandler = async (e) => {
          if (child && typeof child === "object" && "props" in child) {
            await safeExecute(child.props.onClick)(e);
          }
          return clickHandler();
        };
        const childProps = { ...rest, onClick: wrappedChildClickHandler };
        return import_react22.default.cloneElement(child, childProps);
      },
      { component: "SignInButton", renderWhileLoading: true }
    );
    var import_react23 = __toESM(require_react());
    var SignUpButton = withClerk(
      ({ clerk, children, ...props }) => {
        const {
          fallbackRedirectUrl,
          forceRedirectUrl,
          signInFallbackRedirectUrl,
          signInForceRedirectUrl,
          mode,
          unsafeMetadata,
          initialValues,
          oauthFlow,
          ...rest
        } = props;
        children = normalizeWithDefaultValue(children, "Sign up");
        const child = assertSingleChild(children)("SignUpButton");
        const clickHandler = () => {
          const opts = {
            fallbackRedirectUrl,
            forceRedirectUrl,
            signInFallbackRedirectUrl,
            signInForceRedirectUrl,
            unsafeMetadata,
            initialValues,
            oauthFlow
          };
          if (mode === "modal") {
            return clerk.openSignUp({ ...opts, appearance: props.appearance });
          }
          return clerk.redirectToSignUp({
            ...opts,
            signUpFallbackRedirectUrl: fallbackRedirectUrl,
            signUpForceRedirectUrl: forceRedirectUrl
          });
        };
        const wrappedChildClickHandler = async (e) => {
          if (child && typeof child === "object" && "props" in child) {
            await safeExecute(child.props.onClick)(e);
          }
          return clickHandler();
        };
        const childProps = { ...rest, onClick: wrappedChildClickHandler };
        return import_react23.default.cloneElement(child, childProps);
      },
      { component: "SignUpButton", renderWhileLoading: true }
    );
    var import_react24 = __toESM(require_react());
    var SignOutButton = withClerk(
      ({ clerk, children, ...props }) => {
        const { redirectUrl = "/", signOutOptions, ...rest } = props;
        children = normalizeWithDefaultValue(children, "Sign out");
        const child = assertSingleChild(children)("SignOutButton");
        const clickHandler = () => clerk.signOut({ redirectUrl, ...signOutOptions });
        const wrappedChildClickHandler = async (e) => {
          await safeExecute(child.props.onClick)(e);
          return clickHandler();
        };
        const childProps = { ...rest, onClick: wrappedChildClickHandler };
        return import_react24.default.cloneElement(child, childProps);
      },
      { component: "SignOutButton", renderWhileLoading: true }
    );
    var import_react25 = __toESM(require_react());
    var SignInWithMetamaskButton = withClerk(
      ({ clerk, children, ...props }) => {
        const { redirectUrl, ...rest } = props;
        children = normalizeWithDefaultValue(children, "Sign in with Metamask");
        const child = assertSingleChild(children)("SignInWithMetamaskButton");
        const clickHandler = async () => {
          async function authenticate() {
            await clerk.authenticateWithMetamask({ redirectUrl: redirectUrl || void 0 });
          }
          void authenticate();
        };
        const wrappedChildClickHandler = async (e) => {
          await safeExecute(child.props.onClick)(e);
          return clickHandler();
        };
        const childProps = { ...rest, onClick: wrappedChildClickHandler };
        return import_react25.default.cloneElement(child, childProps);
      },
      { component: "SignInWithMetamask", renderWhileLoading: true }
    );
    var import_keys = require_keys();
    var import_react28 = __toESM(require_react());
    var import_deriveState = require_deriveState();
    var import_react26 = require_react2();
    var import_react27 = __toESM(require_react());
    var import_browser = require_browser();
    var import_clerkEventBus = require_clerkEventBus();
    var import_loadClerkJsScript = require_loadClerkJsScript();
    var import_utils10 = require_utils();
    if (typeof globalThis.__BUILD_DISABLE_RHC__ === "undefined") {
      globalThis.__BUILD_DISABLE_RHC__ = false;
    }
    var SDK_METADATA = {
      name: "@clerk/clerk-react",
      version: "5.30.4",
      environment: "development"
    };
    var _status;
    var _domain;
    var _proxyUrl;
    var _publishableKey;
    var _eventBus;
    var _instance;
    var _IsomorphicClerk_instances;
    var waitForClerkJS_fn;
    var _IsomorphicClerk = class _IsomorphicClerk2 {
      constructor(options) {
        __privateAdd(this, _IsomorphicClerk_instances);
        this.clerkjs = null;
        this.preopenOneTap = null;
        this.preopenUserVerification = null;
        this.preopenSignIn = null;
        this.preopenCheckout = null;
        this.preopenPlanDetails = null;
        this.preopenSignUp = null;
        this.preopenUserProfile = null;
        this.preopenOrganizationProfile = null;
        this.preopenCreateOrganization = null;
        this.preOpenWaitlist = null;
        this.premountSignInNodes = /* @__PURE__ */ new Map();
        this.premountSignUpNodes = /* @__PURE__ */ new Map();
        this.premountUserProfileNodes = /* @__PURE__ */ new Map();
        this.premountUserButtonNodes = /* @__PURE__ */ new Map();
        this.premountOrganizationProfileNodes = /* @__PURE__ */ new Map();
        this.premountCreateOrganizationNodes = /* @__PURE__ */ new Map();
        this.premountOrganizationSwitcherNodes = /* @__PURE__ */ new Map();
        this.premountOrganizationListNodes = /* @__PURE__ */ new Map();
        this.premountMethodCalls = /* @__PURE__ */ new Map();
        this.premountWaitlistNodes = /* @__PURE__ */ new Map();
        this.premountPricingTableNodes = /* @__PURE__ */ new Map();
        this.premountAddListenerCalls = /* @__PURE__ */ new Map();
        this.loadedListeners = [];
        __privateAdd(this, _status, "loading");
        __privateAdd(this, _domain);
        __privateAdd(this, _proxyUrl);
        __privateAdd(this, _publishableKey);
        __privateAdd(this, _eventBus, (0, import_clerkEventBus.createClerkEventBus)());
        this.buildSignInUrl = (opts) => {
          const callback = () => {
            var _a;
            return ((_a = this.clerkjs) == null ? void 0 : _a.buildSignInUrl(opts)) || "";
          };
          if (this.clerkjs && this.loaded) {
            return callback();
          } else {
            this.premountMethodCalls.set("buildSignInUrl", callback);
          }
        };
        this.buildSignUpUrl = (opts) => {
          const callback = () => {
            var _a;
            return ((_a = this.clerkjs) == null ? void 0 : _a.buildSignUpUrl(opts)) || "";
          };
          if (this.clerkjs && this.loaded) {
            return callback();
          } else {
            this.premountMethodCalls.set("buildSignUpUrl", callback);
          }
        };
        this.buildAfterSignInUrl = (...args) => {
          const callback = () => {
            var _a;
            return ((_a = this.clerkjs) == null ? void 0 : _a.buildAfterSignInUrl(...args)) || "";
          };
          if (this.clerkjs && this.loaded) {
            return callback();
          } else {
            this.premountMethodCalls.set("buildAfterSignInUrl", callback);
          }
        };
        this.buildAfterSignUpUrl = (...args) => {
          const callback = () => {
            var _a;
            return ((_a = this.clerkjs) == null ? void 0 : _a.buildAfterSignUpUrl(...args)) || "";
          };
          if (this.clerkjs && this.loaded) {
            return callback();
          } else {
            this.premountMethodCalls.set("buildAfterSignUpUrl", callback);
          }
        };
        this.buildAfterSignOutUrl = () => {
          const callback = () => {
            var _a;
            return ((_a = this.clerkjs) == null ? void 0 : _a.buildAfterSignOutUrl()) || "";
          };
          if (this.clerkjs && this.loaded) {
            return callback();
          } else {
            this.premountMethodCalls.set("buildAfterSignOutUrl", callback);
          }
        };
        this.buildAfterMultiSessionSingleSignOutUrl = () => {
          const callback = () => {
            var _a;
            return ((_a = this.clerkjs) == null ? void 0 : _a.buildAfterMultiSessionSingleSignOutUrl()) || "";
          };
          if (this.clerkjs && this.loaded) {
            return callback();
          } else {
            this.premountMethodCalls.set("buildAfterMultiSessionSingleSignOutUrl", callback);
          }
        };
        this.buildUserProfileUrl = () => {
          const callback = () => {
            var _a;
            return ((_a = this.clerkjs) == null ? void 0 : _a.buildUserProfileUrl()) || "";
          };
          if (this.clerkjs && this.loaded) {
            return callback();
          } else {
            this.premountMethodCalls.set("buildUserProfileUrl", callback);
          }
        };
        this.buildCreateOrganizationUrl = () => {
          const callback = () => {
            var _a;
            return ((_a = this.clerkjs) == null ? void 0 : _a.buildCreateOrganizationUrl()) || "";
          };
          if (this.clerkjs && this.loaded) {
            return callback();
          } else {
            this.premountMethodCalls.set("buildCreateOrganizationUrl", callback);
          }
        };
        this.buildOrganizationProfileUrl = () => {
          const callback = () => {
            var _a;
            return ((_a = this.clerkjs) == null ? void 0 : _a.buildOrganizationProfileUrl()) || "";
          };
          if (this.clerkjs && this.loaded) {
            return callback();
          } else {
            this.premountMethodCalls.set("buildOrganizationProfileUrl", callback);
          }
        };
        this.buildWaitlistUrl = () => {
          const callback = () => {
            var _a;
            return ((_a = this.clerkjs) == null ? void 0 : _a.buildWaitlistUrl()) || "";
          };
          if (this.clerkjs && this.loaded) {
            return callback();
          } else {
            this.premountMethodCalls.set("buildWaitlistUrl", callback);
          }
        };
        this.buildUrlWithAuth = (to) => {
          const callback = () => {
            var _a;
            return ((_a = this.clerkjs) == null ? void 0 : _a.buildUrlWithAuth(to)) || "";
          };
          if (this.clerkjs && this.loaded) {
            return callback();
          } else {
            this.premountMethodCalls.set("buildUrlWithAuth", callback);
          }
        };
        this.handleUnauthenticated = async () => {
          const callback = () => {
            var _a;
            return (_a = this.clerkjs) == null ? void 0 : _a.handleUnauthenticated();
          };
          if (this.clerkjs && this.loaded) {
            void callback();
          } else {
            this.premountMethodCalls.set("handleUnauthenticated", callback);
          }
        };
        this.on = (...args) => {
          var _a;
          if ((_a = this.clerkjs) == null ? void 0 : _a.on) {
            return this.clerkjs.on(...args);
          } else {
            __privateGet(this, _eventBus).on(...args);
          }
        };
        this.off = (...args) => {
          var _a;
          if ((_a = this.clerkjs) == null ? void 0 : _a.off) {
            return this.clerkjs.off(...args);
          } else {
            __privateGet(this, _eventBus).off(...args);
          }
        };
        this.addOnLoaded = (cb) => {
          this.loadedListeners.push(cb);
          if (this.loaded) {
            this.emitLoaded();
          }
        };
        this.emitLoaded = () => {
          this.loadedListeners.forEach((cb) => cb());
          this.loadedListeners = [];
        };
        this.beforeLoad = (clerkjs) => {
          if (!clerkjs) {
            throw new Error("Failed to hydrate latest Clerk JS");
          }
        };
        this.hydrateClerkJS = (clerkjs) => {
          var _a;
          if (!clerkjs) {
            throw new Error("Failed to hydrate latest Clerk JS");
          }
          this.clerkjs = clerkjs;
          this.premountMethodCalls.forEach((cb) => cb());
          this.premountAddListenerCalls.forEach((listenerHandlers, listener) => {
            listenerHandlers.nativeUnsubscribe = clerkjs.addListener(listener);
          });
          (_a = __privateGet(this, _eventBus).internal.retrieveListeners("status")) == null ? void 0 : _a.forEach((listener) => {
            this.on("status", listener, { notify: true });
          });
          if (this.preopenSignIn !== null) {
            clerkjs.openSignIn(this.preopenSignIn);
          }
          if (this.preopenCheckout !== null) {
            clerkjs.__internal_openCheckout(this.preopenCheckout);
          }
          if (this.preopenPlanDetails !== null) {
            clerkjs.__internal_openPlanDetails(this.preopenPlanDetails);
          }
          if (this.preopenSignUp !== null) {
            clerkjs.openSignUp(this.preopenSignUp);
          }
          if (this.preopenUserProfile !== null) {
            clerkjs.openUserProfile(this.preopenUserProfile);
          }
          if (this.preopenUserVerification !== null) {
            clerkjs.__internal_openReverification(this.preopenUserVerification);
          }
          if (this.preopenOneTap !== null) {
            clerkjs.openGoogleOneTap(this.preopenOneTap);
          }
          if (this.preopenOrganizationProfile !== null) {
            clerkjs.openOrganizationProfile(this.preopenOrganizationProfile);
          }
          if (this.preopenCreateOrganization !== null) {
            clerkjs.openCreateOrganization(this.preopenCreateOrganization);
          }
          if (this.preOpenWaitlist !== null) {
            clerkjs.openWaitlist(this.preOpenWaitlist);
          }
          this.premountSignInNodes.forEach((props, node) => {
            clerkjs.mountSignIn(node, props);
          });
          this.premountSignUpNodes.forEach((props, node) => {
            clerkjs.mountSignUp(node, props);
          });
          this.premountUserProfileNodes.forEach((props, node) => {
            clerkjs.mountUserProfile(node, props);
          });
          this.premountUserButtonNodes.forEach((props, node) => {
            clerkjs.mountUserButton(node, props);
          });
          this.premountOrganizationListNodes.forEach((props, node) => {
            clerkjs.mountOrganizationList(node, props);
          });
          this.premountWaitlistNodes.forEach((props, node) => {
            clerkjs.mountWaitlist(node, props);
          });
          this.premountPricingTableNodes.forEach((props, node) => {
            clerkjs.__experimental_mountPricingTable(node, props);
          });
          if (typeof this.clerkjs.status === "undefined") {
            __privateGet(this, _eventBus).emit(import_clerkEventBus.clerkEvents.Status, "ready");
          }
          this.emitLoaded();
          return this.clerkjs;
        };
        this.__unstable__updateProps = async (props) => {
          const clerkjs = await __privateMethod(this, _IsomorphicClerk_instances, waitForClerkJS_fn).call(this);
          if (clerkjs && "__unstable__updateProps" in clerkjs) {
            return clerkjs.__unstable__updateProps(props);
          }
        };
        this.__experimental_nextTask = async (params) => {
          if (this.clerkjs) {
            return this.clerkjs.__experimental_nextTask(params);
          } else {
            return Promise.reject();
          }
        };
        this.setActive = (params) => {
          if (this.clerkjs) {
            return this.clerkjs.setActive(params);
          } else {
            return Promise.reject();
          }
        };
        this.openSignIn = (props) => {
          if (this.clerkjs && this.loaded) {
            this.clerkjs.openSignIn(props);
          } else {
            this.preopenSignIn = props;
          }
        };
        this.closeSignIn = () => {
          if (this.clerkjs && this.loaded) {
            this.clerkjs.closeSignIn();
          } else {
            this.preopenSignIn = null;
          }
        };
        this.__internal_openCheckout = (props) => {
          if (this.clerkjs && this.loaded) {
            this.clerkjs.__internal_openCheckout(props);
          } else {
            this.preopenCheckout = props;
          }
        };
        this.__internal_closeCheckout = () => {
          if (this.clerkjs && this.loaded) {
            this.clerkjs.__internal_closeCheckout();
          } else {
            this.preopenCheckout = null;
          }
        };
        this.__internal_openPlanDetails = (props) => {
          if (this.clerkjs && this.loaded) {
            this.clerkjs.__internal_openPlanDetails(props);
          } else {
            this.preopenPlanDetails = props;
          }
        };
        this.__internal_closePlanDetails = () => {
          if (this.clerkjs && this.loaded) {
            this.clerkjs.__internal_closePlanDetails();
          } else {
            this.preopenPlanDetails = null;
          }
        };
        this.__internal_openReverification = (props) => {
          if (this.clerkjs && this.loaded) {
            this.clerkjs.__internal_openReverification(props);
          } else {
            this.preopenUserVerification = props;
          }
        };
        this.__internal_closeReverification = () => {
          if (this.clerkjs && this.loaded) {
            this.clerkjs.__internal_closeReverification();
          } else {
            this.preopenUserVerification = null;
          }
        };
        this.openGoogleOneTap = (props) => {
          if (this.clerkjs && this.loaded) {
            this.clerkjs.openGoogleOneTap(props);
          } else {
            this.preopenOneTap = props;
          }
        };
        this.closeGoogleOneTap = () => {
          if (this.clerkjs && this.loaded) {
            this.clerkjs.closeGoogleOneTap();
          } else {
            this.preopenOneTap = null;
          }
        };
        this.openUserProfile = (props) => {
          if (this.clerkjs && this.loaded) {
            this.clerkjs.openUserProfile(props);
          } else {
            this.preopenUserProfile = props;
          }
        };
        this.closeUserProfile = () => {
          if (this.clerkjs && this.loaded) {
            this.clerkjs.closeUserProfile();
          } else {
            this.preopenUserProfile = null;
          }
        };
        this.openOrganizationProfile = (props) => {
          if (this.clerkjs && this.loaded) {
            this.clerkjs.openOrganizationProfile(props);
          } else {
            this.preopenOrganizationProfile = props;
          }
        };
        this.closeOrganizationProfile = () => {
          if (this.clerkjs && this.loaded) {
            this.clerkjs.closeOrganizationProfile();
          } else {
            this.preopenOrganizationProfile = null;
          }
        };
        this.openCreateOrganization = (props) => {
          if (this.clerkjs && this.loaded) {
            this.clerkjs.openCreateOrganization(props);
          } else {
            this.preopenCreateOrganization = props;
          }
        };
        this.closeCreateOrganization = () => {
          if (this.clerkjs && this.loaded) {
            this.clerkjs.closeCreateOrganization();
          } else {
            this.preopenCreateOrganization = null;
          }
        };
        this.openWaitlist = (props) => {
          if (this.clerkjs && this.loaded) {
            this.clerkjs.openWaitlist(props);
          } else {
            this.preOpenWaitlist = props;
          }
        };
        this.closeWaitlist = () => {
          if (this.clerkjs && this.loaded) {
            this.clerkjs.closeWaitlist();
          } else {
            this.preOpenWaitlist = null;
          }
        };
        this.openSignUp = (props) => {
          if (this.clerkjs && this.loaded) {
            this.clerkjs.openSignUp(props);
          } else {
            this.preopenSignUp = props;
          }
        };
        this.closeSignUp = () => {
          if (this.clerkjs && this.loaded) {
            this.clerkjs.closeSignUp();
          } else {
            this.preopenSignUp = null;
          }
        };
        this.mountSignIn = (node, props) => {
          if (this.clerkjs && this.loaded) {
            this.clerkjs.mountSignIn(node, props);
          } else {
            this.premountSignInNodes.set(node, props);
          }
        };
        this.unmountSignIn = (node) => {
          if (this.clerkjs && this.loaded) {
            this.clerkjs.unmountSignIn(node);
          } else {
            this.premountSignInNodes.delete(node);
          }
        };
        this.mountSignUp = (node, props) => {
          if (this.clerkjs && this.loaded) {
            this.clerkjs.mountSignUp(node, props);
          } else {
            this.premountSignUpNodes.set(node, props);
          }
        };
        this.unmountSignUp = (node) => {
          if (this.clerkjs && this.loaded) {
            this.clerkjs.unmountSignUp(node);
          } else {
            this.premountSignUpNodes.delete(node);
          }
        };
        this.mountUserProfile = (node, props) => {
          if (this.clerkjs && this.loaded) {
            this.clerkjs.mountUserProfile(node, props);
          } else {
            this.premountUserProfileNodes.set(node, props);
          }
        };
        this.unmountUserProfile = (node) => {
          if (this.clerkjs && this.loaded) {
            this.clerkjs.unmountUserProfile(node);
          } else {
            this.premountUserProfileNodes.delete(node);
          }
        };
        this.mountOrganizationProfile = (node, props) => {
          if (this.clerkjs && this.loaded) {
            this.clerkjs.mountOrganizationProfile(node, props);
          } else {
            this.premountOrganizationProfileNodes.set(node, props);
          }
        };
        this.unmountOrganizationProfile = (node) => {
          if (this.clerkjs && this.loaded) {
            this.clerkjs.unmountOrganizationProfile(node);
          } else {
            this.premountOrganizationProfileNodes.delete(node);
          }
        };
        this.mountCreateOrganization = (node, props) => {
          if (this.clerkjs && this.loaded) {
            this.clerkjs.mountCreateOrganization(node, props);
          } else {
            this.premountCreateOrganizationNodes.set(node, props);
          }
        };
        this.unmountCreateOrganization = (node) => {
          if (this.clerkjs && this.loaded) {
            this.clerkjs.unmountCreateOrganization(node);
          } else {
            this.premountCreateOrganizationNodes.delete(node);
          }
        };
        this.mountOrganizationSwitcher = (node, props) => {
          if (this.clerkjs && this.loaded) {
            this.clerkjs.mountOrganizationSwitcher(node, props);
          } else {
            this.premountOrganizationSwitcherNodes.set(node, props);
          }
        };
        this.unmountOrganizationSwitcher = (node) => {
          if (this.clerkjs && this.loaded) {
            this.clerkjs.unmountOrganizationSwitcher(node);
          } else {
            this.premountOrganizationSwitcherNodes.delete(node);
          }
        };
        this.__experimental_prefetchOrganizationSwitcher = () => {
          const callback = () => {
            var _a;
            return (_a = this.clerkjs) == null ? void 0 : _a.__experimental_prefetchOrganizationSwitcher();
          };
          if (this.clerkjs && this.loaded) {
            void callback();
          } else {
            this.premountMethodCalls.set("__experimental_prefetchOrganizationSwitcher", callback);
          }
        };
        this.mountOrganizationList = (node, props) => {
          if (this.clerkjs && this.loaded) {
            this.clerkjs.mountOrganizationList(node, props);
          } else {
            this.premountOrganizationListNodes.set(node, props);
          }
        };
        this.unmountOrganizationList = (node) => {
          if (this.clerkjs && this.loaded) {
            this.clerkjs.unmountOrganizationList(node);
          } else {
            this.premountOrganizationListNodes.delete(node);
          }
        };
        this.mountUserButton = (node, userButtonProps) => {
          if (this.clerkjs && this.loaded) {
            this.clerkjs.mountUserButton(node, userButtonProps);
          } else {
            this.premountUserButtonNodes.set(node, userButtonProps);
          }
        };
        this.unmountUserButton = (node) => {
          if (this.clerkjs && this.loaded) {
            this.clerkjs.unmountUserButton(node);
          } else {
            this.premountUserButtonNodes.delete(node);
          }
        };
        this.mountWaitlist = (node, props) => {
          if (this.clerkjs && this.loaded) {
            this.clerkjs.mountWaitlist(node, props);
          } else {
            this.premountWaitlistNodes.set(node, props);
          }
        };
        this.unmountWaitlist = (node) => {
          if (this.clerkjs && this.loaded) {
            this.clerkjs.unmountWaitlist(node);
          } else {
            this.premountWaitlistNodes.delete(node);
          }
        };
        this.__experimental_mountPricingTable = (node, props) => {
          if (this.clerkjs && this.loaded) {
            this.clerkjs.__experimental_mountPricingTable(node, props);
          } else {
            this.premountPricingTableNodes.set(node, props);
          }
        };
        this.__experimental_unmountPricingTable = (node) => {
          if (this.clerkjs && this.loaded) {
            this.clerkjs.__experimental_unmountPricingTable(node);
          } else {
            this.premountPricingTableNodes.delete(node);
          }
        };
        this.addListener = (listener) => {
          if (this.clerkjs) {
            return this.clerkjs.addListener(listener);
          } else {
            const unsubscribe = () => {
              var _a;
              const listenerHandlers = this.premountAddListenerCalls.get(listener);
              if (listenerHandlers) {
                (_a = listenerHandlers.nativeUnsubscribe) == null ? void 0 : _a.call(listenerHandlers);
                this.premountAddListenerCalls.delete(listener);
              }
            };
            this.premountAddListenerCalls.set(listener, { unsubscribe, nativeUnsubscribe: void 0 });
            return unsubscribe;
          }
        };
        this.navigate = (to) => {
          const callback = () => {
            var _a;
            return (_a = this.clerkjs) == null ? void 0 : _a.navigate(to);
          };
          if (this.clerkjs && this.loaded) {
            void callback();
          } else {
            this.premountMethodCalls.set("navigate", callback);
          }
        };
        this.redirectWithAuth = async (...args) => {
          const callback = () => {
            var _a;
            return (_a = this.clerkjs) == null ? void 0 : _a.redirectWithAuth(...args);
          };
          if (this.clerkjs && this.loaded) {
            return callback();
          } else {
            this.premountMethodCalls.set("redirectWithAuth", callback);
            return;
          }
        };
        this.redirectToSignIn = async (opts) => {
          const callback = () => {
            var _a;
            return (_a = this.clerkjs) == null ? void 0 : _a.redirectToSignIn(opts);
          };
          if (this.clerkjs && this.loaded) {
            return callback();
          } else {
            this.premountMethodCalls.set("redirectToSignIn", callback);
            return;
          }
        };
        this.redirectToSignUp = async (opts) => {
          const callback = () => {
            var _a;
            return (_a = this.clerkjs) == null ? void 0 : _a.redirectToSignUp(opts);
          };
          if (this.clerkjs && this.loaded) {
            return callback();
          } else {
            this.premountMethodCalls.set("redirectToSignUp", callback);
            return;
          }
        };
        this.redirectToUserProfile = async () => {
          const callback = () => {
            var _a;
            return (_a = this.clerkjs) == null ? void 0 : _a.redirectToUserProfile();
          };
          if (this.clerkjs && this.loaded) {
            return callback();
          } else {
            this.premountMethodCalls.set("redirectToUserProfile", callback);
            return;
          }
        };
        this.redirectToAfterSignUp = () => {
          const callback = () => {
            var _a;
            return (_a = this.clerkjs) == null ? void 0 : _a.redirectToAfterSignUp();
          };
          if (this.clerkjs && this.loaded) {
            return callback();
          } else {
            this.premountMethodCalls.set("redirectToAfterSignUp", callback);
          }
        };
        this.redirectToAfterSignIn = () => {
          const callback = () => {
            var _a;
            return (_a = this.clerkjs) == null ? void 0 : _a.redirectToAfterSignIn();
          };
          if (this.clerkjs && this.loaded) {
            callback();
          } else {
            this.premountMethodCalls.set("redirectToAfterSignIn", callback);
          }
        };
        this.redirectToAfterSignOut = () => {
          const callback = () => {
            var _a;
            return (_a = this.clerkjs) == null ? void 0 : _a.redirectToAfterSignOut();
          };
          if (this.clerkjs && this.loaded) {
            callback();
          } else {
            this.premountMethodCalls.set("redirectToAfterSignOut", callback);
          }
        };
        this.redirectToOrganizationProfile = async () => {
          const callback = () => {
            var _a;
            return (_a = this.clerkjs) == null ? void 0 : _a.redirectToOrganizationProfile();
          };
          if (this.clerkjs && this.loaded) {
            return callback();
          } else {
            this.premountMethodCalls.set("redirectToOrganizationProfile", callback);
            return;
          }
        };
        this.redirectToCreateOrganization = async () => {
          const callback = () => {
            var _a;
            return (_a = this.clerkjs) == null ? void 0 : _a.redirectToCreateOrganization();
          };
          if (this.clerkjs && this.loaded) {
            return callback();
          } else {
            this.premountMethodCalls.set("redirectToCreateOrganization", callback);
            return;
          }
        };
        this.redirectToWaitlist = async () => {
          const callback = () => {
            var _a;
            return (_a = this.clerkjs) == null ? void 0 : _a.redirectToWaitlist();
          };
          if (this.clerkjs && this.loaded) {
            return callback();
          } else {
            this.premountMethodCalls.set("redirectToWaitlist", callback);
            return;
          }
        };
        this.handleRedirectCallback = async (params) => {
          var _a;
          const callback = () => {
            var _a2;
            return (_a2 = this.clerkjs) == null ? void 0 : _a2.handleRedirectCallback(params);
          };
          if (this.clerkjs && this.loaded) {
            void ((_a = callback()) == null ? void 0 : _a.catch(() => {
            }));
          } else {
            this.premountMethodCalls.set("handleRedirectCallback", callback);
          }
        };
        this.handleGoogleOneTapCallback = async (signInOrUp, params) => {
          var _a;
          const callback = () => {
            var _a2;
            return (_a2 = this.clerkjs) == null ? void 0 : _a2.handleGoogleOneTapCallback(signInOrUp, params);
          };
          if (this.clerkjs && this.loaded) {
            void ((_a = callback()) == null ? void 0 : _a.catch(() => {
            }));
          } else {
            this.premountMethodCalls.set("handleGoogleOneTapCallback", callback);
          }
        };
        this.handleEmailLinkVerification = async (params) => {
          const callback = () => {
            var _a;
            return (_a = this.clerkjs) == null ? void 0 : _a.handleEmailLinkVerification(params);
          };
          if (this.clerkjs && this.loaded) {
            return callback();
          } else {
            this.premountMethodCalls.set("handleEmailLinkVerification", callback);
          }
        };
        this.authenticateWithMetamask = async (params) => {
          const callback = () => {
            var _a;
            return (_a = this.clerkjs) == null ? void 0 : _a.authenticateWithMetamask(params);
          };
          if (this.clerkjs && this.loaded) {
            return callback();
          } else {
            this.premountMethodCalls.set("authenticateWithMetamask", callback);
          }
        };
        this.authenticateWithCoinbaseWallet = async (params) => {
          const callback = () => {
            var _a;
            return (_a = this.clerkjs) == null ? void 0 : _a.authenticateWithCoinbaseWallet(params);
          };
          if (this.clerkjs && this.loaded) {
            return callback();
          } else {
            this.premountMethodCalls.set("authenticateWithCoinbaseWallet", callback);
          }
        };
        this.authenticateWithOKXWallet = async (params) => {
          const callback = () => {
            var _a;
            return (_a = this.clerkjs) == null ? void 0 : _a.authenticateWithOKXWallet(params);
          };
          if (this.clerkjs && this.loaded) {
            return callback();
          } else {
            this.premountMethodCalls.set("authenticateWithOKXWallet", callback);
          }
        };
        this.authenticateWithWeb3 = async (params) => {
          const callback = () => {
            var _a;
            return (_a = this.clerkjs) == null ? void 0 : _a.authenticateWithWeb3(params);
          };
          if (this.clerkjs && this.loaded) {
            return callback();
          } else {
            this.premountMethodCalls.set("authenticateWithWeb3", callback);
          }
        };
        this.authenticateWithGoogleOneTap = async (params) => {
          const clerkjs = await __privateMethod(this, _IsomorphicClerk_instances, waitForClerkJS_fn).call(this);
          return clerkjs.authenticateWithGoogleOneTap(params);
        };
        this.createOrganization = async (params) => {
          const callback = () => {
            var _a;
            return (_a = this.clerkjs) == null ? void 0 : _a.createOrganization(params);
          };
          if (this.clerkjs && this.loaded) {
            return callback();
          } else {
            this.premountMethodCalls.set("createOrganization", callback);
          }
        };
        this.getOrganization = async (organizationId) => {
          const callback = () => {
            var _a;
            return (_a = this.clerkjs) == null ? void 0 : _a.getOrganization(organizationId);
          };
          if (this.clerkjs && this.loaded) {
            return callback();
          } else {
            this.premountMethodCalls.set("getOrganization", callback);
          }
        };
        this.joinWaitlist = async (params) => {
          const callback = () => {
            var _a;
            return (_a = this.clerkjs) == null ? void 0 : _a.joinWaitlist(params);
          };
          if (this.clerkjs && this.loaded) {
            return callback();
          } else {
            this.premountMethodCalls.set("joinWaitlist", callback);
          }
        };
        this.signOut = async (...args) => {
          const callback = () => {
            var _a;
            return (_a = this.clerkjs) == null ? void 0 : _a.signOut(...args);
          };
          if (this.clerkjs && this.loaded) {
            return callback();
          } else {
            this.premountMethodCalls.set("signOut", callback);
          }
        };
        const { Clerk = null, publishableKey } = options || {};
        __privateSet(this, _publishableKey, publishableKey);
        __privateSet(this, _proxyUrl, options == null ? void 0 : options.proxyUrl);
        __privateSet(this, _domain, options == null ? void 0 : options.domain);
        this.options = options;
        this.Clerk = Clerk;
        this.mode = (0, import_browser.inBrowser)() ? "browser" : "server";
        if (!this.options.sdkMetadata) {
          this.options.sdkMetadata = SDK_METADATA;
        }
        __privateGet(this, _eventBus).emit(import_clerkEventBus.clerkEvents.Status, "loading");
        __privateGet(this, _eventBus).prioritizedOn(import_clerkEventBus.clerkEvents.Status, (status) => __privateSet(this, _status, status));
        if (__privateGet(this, _publishableKey)) {
          void this.loadClerkJS();
        }
      }
      get publishableKey() {
        return __privateGet(this, _publishableKey);
      }
      get loaded() {
        var _a;
        return ((_a = this.clerkjs) == null ? void 0 : _a.loaded) || false;
      }
      get status() {
        var _a;
        if (!this.clerkjs) {
          return __privateGet(this, _status);
        }
        return ((_a = this.clerkjs) == null ? void 0 : _a.status) || /**
        * Support older clerk-js versions.
        * If clerk-js is available but `.status` is missing it we need to fallback to `.loaded`.
        * Since "degraded" an "error" did not exist before,
        * map "loaded" to "ready" and "not loaded" to "loading".
        */
        (this.clerkjs.loaded ? "ready" : "loading");
      }
      static getOrCreateInstance(options) {
        if (!(0, import_browser.inBrowser)() || !__privateGet(this, _instance) || options.Clerk && __privateGet(this, _instance).Clerk !== options.Clerk || // Allow hot swapping PKs on the client
        __privateGet(this, _instance).publishableKey !== options.publishableKey) {
          __privateSet(this, _instance, new _IsomorphicClerk2(options));
        }
        return __privateGet(this, _instance);
      }
      static clearInstance() {
        __privateSet(this, _instance, null);
      }
      get domain() {
        if (typeof window !== "undefined" && window.location) {
          return (0, import_utils10.handleValueOrFn)(__privateGet(this, _domain), new URL(window.location.href), "");
        }
        if (typeof __privateGet(this, _domain) === "function") {
          return errorThrower.throw(unsupportedNonBrowserDomainOrProxyUrlFunction);
        }
        return __privateGet(this, _domain) || "";
      }
      get proxyUrl() {
        if (typeof window !== "undefined" && window.location) {
          return (0, import_utils10.handleValueOrFn)(__privateGet(this, _proxyUrl), new URL(window.location.href), "");
        }
        if (typeof __privateGet(this, _proxyUrl) === "function") {
          return errorThrower.throw(unsupportedNonBrowserDomainOrProxyUrlFunction);
        }
        return __privateGet(this, _proxyUrl) || "";
      }
      /**
       * Accesses private options from the `Clerk` instance and defaults to
       * `IsomorphicClerk` options when in SSR context.
       *  @internal
       */
      __internal_getOption(key) {
        var _a, _b;
        return ((_a = this.clerkjs) == null ? void 0 : _a.__internal_getOption) ? (_b = this.clerkjs) == null ? void 0 : _b.__internal_getOption(key) : this.options[key];
      }
      get sdkMetadata() {
        var _a;
        return ((_a = this.clerkjs) == null ? void 0 : _a.sdkMetadata) || this.options.sdkMetadata || void 0;
      }
      get instanceType() {
        var _a;
        return (_a = this.clerkjs) == null ? void 0 : _a.instanceType;
      }
      get frontendApi() {
        var _a;
        return ((_a = this.clerkjs) == null ? void 0 : _a.frontendApi) || "";
      }
      get isStandardBrowser() {
        var _a;
        return ((_a = this.clerkjs) == null ? void 0 : _a.isStandardBrowser) || this.options.standardBrowser || false;
      }
      get isSatellite() {
        if (typeof window !== "undefined" && window.location) {
          return (0, import_utils10.handleValueOrFn)(this.options.isSatellite, new URL(window.location.href), false);
        }
        if (typeof this.options.isSatellite === "function") {
          return errorThrower.throw(unsupportedNonBrowserDomainOrProxyUrlFunction);
        }
        return false;
      }
      async loadClerkJS() {
        var _a;
        if (this.mode !== "browser" || this.loaded) {
          return;
        }
        if (typeof window !== "undefined") {
          window.__clerk_publishable_key = __privateGet(this, _publishableKey);
          window.__clerk_proxy_url = this.proxyUrl;
          window.__clerk_domain = this.domain;
        }
        try {
          if (this.Clerk) {
            let c;
            if (isConstructor(this.Clerk)) {
              c = new this.Clerk(__privateGet(this, _publishableKey), {
                proxyUrl: this.proxyUrl,
                domain: this.domain
              });
              this.beforeLoad(c);
              await c.load(this.options);
            } else {
              c = this.Clerk;
              if (!c.loaded) {
                this.beforeLoad(c);
                await c.load(this.options);
              }
            }
            globalThis.Clerk = c;
          } else if (!__BUILD_DISABLE_RHC__) {
            if (!globalThis.Clerk) {
              await (0, import_loadClerkJsScript.loadClerkJsScript)({
                ...this.options,
                publishableKey: __privateGet(this, _publishableKey),
                proxyUrl: this.proxyUrl,
                domain: this.domain,
                nonce: this.options.nonce
              });
            }
            if (!globalThis.Clerk) {
              throw new Error("Failed to download latest ClerkJS. Contact support@clerk.com.");
            }
            this.beforeLoad(globalThis.Clerk);
            await globalThis.Clerk.load(this.options);
          }
          if ((_a = globalThis.Clerk) == null ? void 0 : _a.loaded) {
            return this.hydrateClerkJS(globalThis.Clerk);
          }
          return;
        } catch (err) {
          const error = err;
          __privateGet(this, _eventBus).emit(import_clerkEventBus.clerkEvents.Status, "error");
          console.error(error.stack || error.message || error);
          return;
        }
      }
      get version() {
        var _a;
        return (_a = this.clerkjs) == null ? void 0 : _a.version;
      }
      get client() {
        if (this.clerkjs) {
          return this.clerkjs.client;
        } else {
          return void 0;
        }
      }
      get session() {
        if (this.clerkjs) {
          return this.clerkjs.session;
        } else {
          return void 0;
        }
      }
      get user() {
        if (this.clerkjs) {
          return this.clerkjs.user;
        } else {
          return void 0;
        }
      }
      get organization() {
        if (this.clerkjs) {
          return this.clerkjs.organization;
        } else {
          return void 0;
        }
      }
      get telemetry() {
        if (this.clerkjs) {
          return this.clerkjs.telemetry;
        } else {
          return void 0;
        }
      }
      get __unstable__environment() {
        if (this.clerkjs) {
          return this.clerkjs.__unstable__environment;
        } else {
          return void 0;
        }
      }
      get isSignedIn() {
        if (this.clerkjs) {
          return this.clerkjs.isSignedIn;
        } else {
          return false;
        }
      }
      get __experimental_commerce() {
        var _a;
        return (_a = this.clerkjs) == null ? void 0 : _a.__experimental_commerce;
      }
      __unstable__setEnvironment(...args) {
        if (this.clerkjs && "__unstable__setEnvironment" in this.clerkjs) {
          this.clerkjs.__unstable__setEnvironment(args);
        } else {
          return void 0;
        }
      }
    };
    _status = /* @__PURE__ */ new WeakMap();
    _domain = /* @__PURE__ */ new WeakMap();
    _proxyUrl = /* @__PURE__ */ new WeakMap();
    _publishableKey = /* @__PURE__ */ new WeakMap();
    _eventBus = /* @__PURE__ */ new WeakMap();
    _instance = /* @__PURE__ */ new WeakMap();
    _IsomorphicClerk_instances = /* @__PURE__ */ new WeakSet();
    waitForClerkJS_fn = function() {
      return new Promise((resolve) => {
        this.addOnLoaded(() => resolve(this.clerkjs));
      });
    };
    __privateAdd(_IsomorphicClerk, _instance);
    var IsomorphicClerk = _IsomorphicClerk;
    function ClerkContextProvider(props) {
      const { isomorphicClerkOptions, initialState, children } = props;
      const { isomorphicClerk: clerk, clerkStatus } = useLoadedIsomorphicClerk(isomorphicClerkOptions);
      const [state, setState] = import_react27.default.useState({
        client: clerk.client,
        session: clerk.session,
        user: clerk.user,
        organization: clerk.organization
      });
      import_react27.default.useEffect(() => {
        return clerk.addListener((e) => setState({ ...e }));
      }, []);
      const derivedState = (0, import_deriveState.deriveState)(clerk.loaded, state, initialState);
      const clerkCtx = import_react27.default.useMemo(
        () => ({ value: clerk }),
        [
          // Only update the clerk reference on status change
          clerkStatus
        ]
      );
      const clientCtx = import_react27.default.useMemo(() => ({ value: state.client }), [state.client]);
      const {
        sessionId,
        sessionStatus,
        sessionClaims,
        session,
        userId,
        user,
        orgId,
        actor,
        organization,
        orgRole,
        orgSlug,
        orgPermissions,
        factorVerificationAge
      } = derivedState;
      const authCtx = import_react27.default.useMemo(() => {
        const value = {
          sessionId,
          sessionStatus,
          sessionClaims,
          userId,
          actor,
          orgId,
          orgRole,
          orgSlug,
          orgPermissions,
          factorVerificationAge
        };
        return { value };
      }, [sessionId, sessionStatus, userId, actor, orgId, orgRole, orgSlug, factorVerificationAge, sessionClaims == null ? void 0 : sessionClaims.__raw]);
      const sessionCtx = import_react27.default.useMemo(() => ({ value: session }), [sessionId, session]);
      const userCtx = import_react27.default.useMemo(() => ({ value: user }), [userId, user]);
      const organizationCtx = import_react27.default.useMemo(() => {
        const value = {
          organization
        };
        return { value };
      }, [orgId, organization]);
      return (
        // @ts-expect-error value passed is of type IsomorphicClerk where the context expects LoadedClerk
        /* @__PURE__ */ import_react27.default.createElement(IsomorphicClerkContext.Provider, { value: clerkCtx }, /* @__PURE__ */ import_react27.default.createElement(import_react26.ClientContext.Provider, { value: clientCtx }, /* @__PURE__ */ import_react27.default.createElement(import_react26.SessionContext.Provider, { value: sessionCtx }, /* @__PURE__ */ import_react27.default.createElement(import_react26.OrganizationProvider, { ...organizationCtx.value }, /* @__PURE__ */ import_react27.default.createElement(AuthContext.Provider, { value: authCtx }, /* @__PURE__ */ import_react27.default.createElement(import_react26.UserContext.Provider, { value: userCtx }, children))))))
      );
    }
    var useLoadedIsomorphicClerk = (options) => {
      const isomorphicClerk = import_react27.default.useMemo(() => IsomorphicClerk.getOrCreateInstance(options), []);
      const [clerkStatus, setStatus] = import_react27.default.useState(isomorphicClerk.status);
      import_react27.default.useEffect(() => {
        void isomorphicClerk.__unstable__updateProps({ appearance: options.appearance });
      }, [options.appearance]);
      import_react27.default.useEffect(() => {
        void isomorphicClerk.__unstable__updateProps({ options });
      }, [options.localization]);
      import_react27.default.useEffect(() => {
        isomorphicClerk.on("status", setStatus);
        return () => isomorphicClerk.off("status", setStatus);
      }, [isomorphicClerk]);
      import_react27.default.useEffect(() => {
        return () => {
          IsomorphicClerk.clearInstance();
        };
      }, []);
      return { isomorphicClerk, clerkStatus };
    };
    function ClerkProviderBase(props) {
      const { initialState, children, __internal_bypassMissingPublishableKey, ...restIsomorphicClerkOptions } = props;
      const { publishableKey = "", Clerk: userInitialisedClerk } = restIsomorphicClerkOptions;
      if (!userInitialisedClerk && !__internal_bypassMissingPublishableKey) {
        if (!publishableKey) {
          errorThrower.throwMissingPublishableKeyError();
        } else if (publishableKey && !(0, import_keys.isPublishableKey)(publishableKey)) {
          errorThrower.throwInvalidPublishableKeyError({ key: publishableKey });
        }
      }
      return /* @__PURE__ */ import_react28.default.createElement(
        ClerkContextProvider,
        {
          initialState,
          isomorphicClerkOptions: restIsomorphicClerkOptions
        },
        children
      );
    }
    var ClerkProvider = withMaxAllowedInstancesGuard(ClerkProviderBase, "ClerkProvider", multipleClerkProvidersError);
    ClerkProvider.displayName = "ClerkProvider";
    setErrorThrowerOptions({ packageName: "@clerk/clerk-react" });
    (0, import_loadClerkJsScript2.setClerkJsLoadingErrorPackageName)("@clerk/clerk-react");
  }
});

// ../node_modules/@clerk/remix/dist/utils/errors.js
var require_errors = __commonJS({
  "../node_modules/@clerk/remix/dist/utils/errors.js"(exports, module) {
    "use strict";
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS2 = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
    var errors_exports = {};
    __export(errors_exports, {
      invalidClerkStatePropError: () => invalidClerkStatePropError,
      invalidRootLoaderCallbackReturn: () => invalidRootLoaderCallbackReturn,
      noClerkStateError: () => noClerkStateError,
      noLoaderArgsPassedInGetAuth: () => noLoaderArgsPassedInGetAuth,
      noSecretKeyError: () => noSecretKeyError,
      publishableKeyMissingErrorInSpaMode: () => publishableKeyMissingErrorInSpaMode,
      satelliteAndMissingProxyUrlAndDomain: () => satelliteAndMissingProxyUrlAndDomain,
      satelliteAndMissingSignInUrl: () => satelliteAndMissingSignInUrl
    });
    module.exports = __toCommonJS2(errors_exports);
    var createErrorMessage = (msg) => {
      return `\u{1F512} Clerk: ${msg.trim()}

For more info, check out the docs: https://clerk.com/docs,
or come say hi in our discord server: https://clerk.com/discord

`;
    };
    var ssrExample = `Use 'rootAuthLoader' as your root loader. Then, simply wrap the App component with ClerkApp and make it the default export.
Example:

import { ClerkApp } from '@clerk/remix';
import { rootAuthLoader } from '@clerk/remix/ssr.server';

export const loader: LoaderFunction = args => rootAuthLoader(args)

function App() {
  return (
    <html lang='en'>
      ...
    </html>
  );
}

export default ClerkApp(App, { publishableKey: '...' });
`;
    var invalidClerkStatePropError = createErrorMessage(`
You're trying to pass an invalid object in "<ClerkProvider clerkState={...}>".

${ssrExample}
`);
    var noClerkStateError = createErrorMessage(`
Looks like you didn't pass 'clerkState' to "<ClerkProvider clerkState={...}>".

${ssrExample}
`);
    var noLoaderArgsPassedInGetAuth = createErrorMessage(`
You're calling 'getAuth()' from a loader, without providing the loader args object.
Example:

export const loader: LoaderFunction = async (args) => {
  const { sessionId } = await getAuth(args);
  ...
};
`);
    var invalidRootLoaderCallbackReturn = createErrorMessage(`
You're returning an invalid response from the 'rootAuthLoader' called from the loader in root.tsx.
You can only return plain objects, responses created using the Remix 'json()' and 'redirect()' helpers,
custom redirect 'Response' instances (status codes in the range of 300 to 400),
or custom json 'Response' instances (containing a body that is a valid json string).
If you want to return a primitive value or an array, you can always wrap the response with an object.

Example:

export const loader: LoaderFunction = args => rootAuthLoader(args, ({ auth }) => {
    const { userId } = auth;
    const posts: Post[] = database.getPostsByUserId(userId);

    return json({ data: posts })
    // or
    return new Response(JSON.stringify({ data: posts }), { headers: { 'Content-Type': 'application/json' } });
    // or
    return { data: posts };
})
`);
    var noSecretKeyError = createErrorMessage(`
A secretKey must be provided in order to use SSR and the exports from @clerk/remix/api.');
If your runtime supports environment variables, you can add a CLERK_SECRET_KEY variable to your config.
Otherwise, you can pass a secretKey parameter to rootAuthLoader or getAuth.
`);
    var satelliteAndMissingProxyUrlAndDomain = createErrorMessage(
      `Missing domain and proxyUrl. A satellite application needs to specify a domain or a proxyUrl`
    );
    var satelliteAndMissingSignInUrl = createErrorMessage(`
Invalid signInUrl. A satellite application requires a signInUrl for development instances.
Check if signInUrl is missing from your configuration or if it is not an absolute URL.`);
    var publishableKeyMissingErrorInSpaMode = createErrorMessage(`
You're trying to use Clerk in Remix SPA Mode without providing a Publishable Key.
Please provide the publishableKey option on the ClerkApp component.

Example:

export default ClerkApp(App, {
  publishableKey: 'pk_test_XXX'
});
`);
  }
});

// ../node_modules/@clerk/remix/dist/utils/utils.js
var require_utils2 = __commonJS({
  "../node_modules/@clerk/remix/dist/utils/utils.js"(exports, module) {
    "use strict";
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS2 = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
    var utils_exports = {};
    __export(utils_exports, {
      assertEnvVar: () => assertEnvVar,
      assertPublishableKeyInSpaMode: () => assertPublishableKeyInSpaMode,
      assertValidClerkState: () => assertValidClerkState,
      getEnvVariable: () => getEnvVariable,
      inSpaMode: () => inSpaMode,
      warnForSsr: () => warnForSsr
    });
    module.exports = __toCommonJS2(utils_exports);
    var import_errors = require_errors();
    function warnForSsr(val) {
      if (!val || !val.__internal_clerk_state) {
        console.warn(import_errors.noClerkStateError);
      }
    }
    function assertEnvVar(name, errorMessage) {
      if (!name || typeof name !== "string") {
        throw new Error(errorMessage);
      }
    }
    function assertValidClerkState(val) {
      if (!val) {
        throw new Error(import_errors.noClerkStateError);
      }
      if (!!val && !val.__internal_clerk_state) {
        throw new Error(import_errors.invalidClerkStatePropError);
      }
    }
    function assertPublishableKeyInSpaMode(key) {
      if (!key || typeof key !== "string") {
        throw new Error(import_errors.publishableKeyMissingErrorInSpaMode);
      }
    }
    var hasCloudflareProxyContext = (context) => {
      var _a;
      return !!((_a = context == null ? void 0 : context.cloudflare) == null ? void 0 : _a.env);
    };
    var hasCloudflareContext = (context) => {
      return !!(context == null ? void 0 : context.env);
    };
    var getEnvVariable = (name, context) => {
      if (typeof process !== "undefined" && process.env && typeof process.env[name] === "string") {
        return process.env[name];
      }
      if (hasCloudflareProxyContext(context)) {
        return context.cloudflare.env[name] || "";
      }
      if (hasCloudflareContext(context)) {
        return context.env[name] || "";
      }
      if (context && typeof context[name] === "string") {
        return context[name];
      }
      try {
        return globalThis[name];
      } catch {
      }
      return "";
    };
    var inSpaMode = () => {
      var _a;
      if (typeof window !== "undefined" && typeof ((_a = window.__remixContext) == null ? void 0 : _a.isSpaMode) !== "undefined") {
        return window.__remixContext.isSpaMode;
      }
      return false;
    };
  }
});

// ../node_modules/@clerk/remix/dist/utils/index.js
var require_utils3 = __commonJS({
  "../node_modules/@clerk/remix/dist/utils/index.js"(exports, module) {
    "use strict";
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
    var __toCommonJS2 = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
    var utils_exports = {};
    module.exports = __toCommonJS2(utils_exports);
    __reExport(utils_exports, require_utils2(), module.exports);
  }
});

// ../node_modules/@clerk/remix/dist/client/RemixOptionsContext.js
var require_RemixOptionsContext = __commonJS({
  "../node_modules/@clerk/remix/dist/client/RemixOptionsContext.js"(exports, module) {
    "use strict";
    var __create = Object.create;
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __getProtoOf = Object.getPrototypeOf;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
      // If the importer is in node compatibility mode or this is not an ESM
      // file that has been converted to a CommonJS file using a Babel-
      // compatible transform (i.e. "__esModule" has not been set), then set
      // "default" to the CommonJS "module.exports" for node compatibility.
      isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
      mod
    ));
    var __toCommonJS2 = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
    var RemixOptionsContext_exports = {};
    __export(RemixOptionsContext_exports, {
      ClerkRemixOptionsProvider: () => ClerkRemixOptionsProvider,
      useClerkRemixOptions: () => useClerkRemixOptions
    });
    module.exports = __toCommonJS2(RemixOptionsContext_exports);
    var import_react = __toESM(require_react());
    var ClerkRemixOptionsCtx = import_react.default.createContext(void 0);
    ClerkRemixOptionsCtx.displayName = "ClerkRemixOptionsCtx";
    var useClerkRemixOptions = () => {
      const ctx = import_react.default.useContext(ClerkRemixOptionsCtx);
      return ctx.value;
    };
    var ClerkRemixOptionsProvider = (props) => {
      const { children, options } = props;
      return /* @__PURE__ */ import_react.default.createElement(ClerkRemixOptionsCtx.Provider, { value: { value: options } }, children);
    };
  }
});

// ../node_modules/@clerk/remix/dist/client/useAwaitableNavigate.js
var require_useAwaitableNavigate = __commonJS({
  "../node_modules/@clerk/remix/dist/client/useAwaitableNavigate.js"(exports, module) {
    "use strict";
    var __create = Object.create;
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __getProtoOf = Object.getPrototypeOf;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
      // If the importer is in node compatibility mode or this is not an ESM
      // file that has been converted to a CommonJS file using a Babel-
      // compatible transform (i.e. "__esModule" has not been set), then set
      // "default" to the CommonJS "module.exports" for node compatibility.
      isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
      mod
    ));
    var __toCommonJS2 = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
    var useAwaitableNavigate_exports = {};
    __export(useAwaitableNavigate_exports, {
      useAwaitableNavigate: () => useAwaitableNavigate
    });
    module.exports = __toCommonJS2(useAwaitableNavigate_exports);
    var import_react = (init_esm(), __toCommonJS(esm_exports));
    var import_react2 = __toESM(require_react());
    var useAwaitableNavigate = () => {
      const navigate = (0, import_react.useNavigate)();
      const location = (0, import_react.useLocation)();
      const resolveFunctionsRef = import_react2.default.useRef([]);
      const resolveAll = () => {
        resolveFunctionsRef.current.forEach((resolve) => resolve());
        resolveFunctionsRef.current.splice(0, resolveFunctionsRef.current.length);
      };
      import_react2.default.useEffect(() => {
        resolveAll();
      }, [location]);
      return (to, opts) => {
        return new Promise((res) => {
          resolveFunctionsRef.current.push(res);
          navigate(to, opts);
        });
      };
    };
  }
});

// ../node_modules/@clerk/remix/dist/client/RemixClerkProvider.js
var require_RemixClerkProvider = __commonJS({
  "../node_modules/@clerk/remix/dist/client/RemixClerkProvider.js"(exports, module) {
    "use strict";
    var __create = Object.create;
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __getProtoOf = Object.getPrototypeOf;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
    var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
      // If the importer is in node compatibility mode or this is not an ESM
      // file that has been converted to a CommonJS file using a Babel-
      // compatible transform (i.e. "__esModule" has not been set), then set
      // "default" to the CommonJS "module.exports" for node compatibility.
      isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
      mod
    ));
    var __toCommonJS2 = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
    var RemixClerkProvider_exports = {};
    __export(RemixClerkProvider_exports, {
      ClerkProvider: () => ClerkProvider
    });
    module.exports = __toCommonJS2(RemixClerkProvider_exports);
    var import_clerk_react = require_dist2();
    var import_react = __toESM(require_react());
    var import_utils = require_utils3();
    var import_RemixOptionsContext = require_RemixOptionsContext();
    var import_useAwaitableNavigate = require_useAwaitableNavigate();
    __reExport(RemixClerkProvider_exports, require_dist2(), module.exports);
    var SDK_METADATA = {
      name: "@clerk/remix",
      version: "4.6.5"
    };
    var awaitableNavigateRef = { current: void 0 };
    function ClerkProvider({ children, ...rest }) {
      const awaitableNavigate = (0, import_useAwaitableNavigate.useAwaitableNavigate)();
      const isSpaMode = (0, import_utils.inSpaMode)();
      import_react.default.useEffect(() => {
        awaitableNavigateRef.current = awaitableNavigate;
      }, [awaitableNavigate]);
      const { clerkState, ...restProps } = rest;
      import_clerk_react.ClerkProvider.displayName = "ReactClerkProvider";
      if (!isSpaMode) {
        (0, import_utils.assertValidClerkState)(clerkState);
      }
      const {
        __clerk_ssr_state,
        __publishableKey,
        __proxyUrl,
        __domain,
        __isSatellite,
        __clerk_debug,
        __signInUrl,
        __signUpUrl,
        __afterSignInUrl,
        __afterSignUpUrl,
        __signInForceRedirectUrl,
        __signUpForceRedirectUrl,
        __signInFallbackRedirectUrl,
        __signUpFallbackRedirectUrl,
        __clerkJSUrl,
        __clerkJSVersion,
        __telemetryDisabled,
        __telemetryDebug
      } = (clerkState == null ? void 0 : clerkState.__internal_clerk_state) || {};
      import_react.default.useEffect(() => {
        if (!isSpaMode) {
          (0, import_utils.warnForSsr)(clerkState);
        }
      }, []);
      import_react.default.useEffect(() => {
        window.__clerk_debug = __clerk_debug;
      }, []);
      const mergedProps = {
        publishableKey: __publishableKey,
        proxyUrl: __proxyUrl,
        domain: __domain,
        isSatellite: __isSatellite,
        signInUrl: __signInUrl,
        signUpUrl: __signUpUrl,
        afterSignInUrl: __afterSignInUrl,
        afterSignUpUrl: __afterSignUpUrl,
        signInForceRedirectUrl: __signInForceRedirectUrl,
        signUpForceRedirectUrl: __signUpForceRedirectUrl,
        signInFallbackRedirectUrl: __signInFallbackRedirectUrl,
        signUpFallbackRedirectUrl: __signUpFallbackRedirectUrl,
        clerkJSUrl: __clerkJSUrl,
        clerkJSVersion: __clerkJSVersion,
        telemetry: {
          disabled: __telemetryDisabled,
          debug: __telemetryDebug
        }
      };
      return /* @__PURE__ */ import_react.default.createElement(import_RemixOptionsContext.ClerkRemixOptionsProvider, { options: mergedProps }, /* @__PURE__ */ import_react.default.createElement(
        import_clerk_react.ClerkProvider,
        {
          routerPush: (to) => {
            var _a;
            return (_a = awaitableNavigateRef.current) == null ? void 0 : _a.call(awaitableNavigateRef, to);
          },
          routerReplace: (to) => {
            var _a;
            return (_a = awaitableNavigateRef.current) == null ? void 0 : _a.call(awaitableNavigateRef, to, { replace: true });
          },
          initialState: __clerk_ssr_state,
          sdkMetadata: SDK_METADATA,
          ...mergedProps,
          ...restProps
        },
        children
      ));
    }
  }
});

// ../node_modules/@clerk/remix/dist/client/ClerkApp.js
var require_ClerkApp = __commonJS({
  "../node_modules/@clerk/remix/dist/client/ClerkApp.js"(exports, module) {
    "use strict";
    var __create = Object.create;
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __getProtoOf = Object.getPrototypeOf;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
      // If the importer is in node compatibility mode or this is not an ESM
      // file that has been converted to a CommonJS file using a Babel-
      // compatible transform (i.e. "__esModule" has not been set), then set
      // "default" to the CommonJS "module.exports" for node compatibility.
      isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
      mod
    ));
    var __toCommonJS2 = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
    var ClerkApp_exports = {};
    __export(ClerkApp_exports, {
      ClerkApp: () => ClerkApp2
    });
    module.exports = __toCommonJS2(ClerkApp_exports);
    var import_react = (init_esm(), __toCommonJS(esm_exports));
    var import_react2 = __toESM(require_react());
    var import_utils = require_utils3();
    var import_RemixClerkProvider = require_RemixClerkProvider();
    function ClerkApp2(App, opts = {}) {
      return () => {
        let clerkState;
        const isSpaMode = (0, import_utils.inSpaMode)();
        if (!isSpaMode) {
          const loaderData = (0, import_react.useLoaderData)();
          clerkState = loaderData.clerkState;
        }
        if (isSpaMode) {
          (0, import_utils.assertPublishableKeyInSpaMode)(opts.publishableKey);
        }
        return /* @__PURE__ */ import_react2.default.createElement(
          import_RemixClerkProvider.ClerkProvider,
          {
            ...opts,
            clerkState
          },
          /* @__PURE__ */ import_react2.default.createElement(App, null)
        );
      };
    }
  }
});

// ../node_modules/@clerk/remix/dist/client/types.js
var require_types2 = __commonJS({
  "../node_modules/@clerk/remix/dist/client/types.js"(exports, module) {
    "use strict";
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS2 = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
    var types_exports = {};
    module.exports = __toCommonJS2(types_exports);
  }
});

// ../node_modules/@clerk/clerk-react/dist/internal.js
var require_internal2 = __commonJS({
  "../node_modules/@clerk/clerk-react/dist/internal.js"(exports, module) {
    "use strict";
    var __create = Object.create;
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __getProtoOf = Object.getPrototypeOf;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
      // If the importer is in node compatibility mode or this is not an ESM
      // file that has been converted to a CommonJS file using a Babel-
      // compatible transform (i.e. "__esModule" has not been set), then set
      // "default" to the CommonJS "module.exports" for node compatibility.
      isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
      mod
    ));
    var __toCommonJS2 = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
    var internal_exports = {};
    __export(internal_exports, {
      MultisessionAppSupport: () => MultisessionAppSupport,
      buildClerkJsScriptAttributes: () => import_loadClerkJsScript.buildClerkJsScriptAttributes,
      clerkJsScriptUrl: () => import_loadClerkJsScript.clerkJsScriptUrl,
      setClerkJsLoadingErrorPackageName: () => import_loadClerkJsScript.setClerkJsLoadingErrorPackageName,
      setErrorThrowerOptions: () => setErrorThrowerOptions,
      useDerivedAuth: () => useDerivedAuth,
      useRoutingProps: () => useRoutingProps
    });
    module.exports = __toCommonJS2(internal_exports);
    var import_error = require_error();
    var errorThrower = (0, import_error.buildErrorThrower)({ packageName: "@clerk/clerk-react" });
    function setErrorThrowerOptions(options) {
      errorThrower.setMessages(options).setPackageName(options);
    }
    var import_deprecated = require_deprecated();
    var import_react11 = __toESM(require_react());
    var import_react = require_react2();
    var useIsomorphicClerkContext = import_react.useClerkInstanceContext;
    var import_react2 = require_react2();
    var import_authorization = require_authorization();
    var import_telemetry = require_telemetry();
    var import_react5 = require_react();
    var import_react3 = require_react2();
    var [AuthContext, useAuthContext] = (0, import_react3.createContextAndHook)("AuthContext");
    var invalidStateError = "Invalid state. Feel free to submit a bug or reach out to support here: https://clerk.com/support";
    var noPathProvidedError = (componentName) => `The <${componentName}/> component uses path-based routing by default unless a different routing strategy is provided using the \`routing\` prop. When path-based routing is used, you need to provide the path where the component is mounted on by using the \`path\` prop. Example: <${componentName} path={'/my-path'} />`;
    var incompatibleRoutingWithPathProvidedError = (componentName) => `The \`path\` prop will only be respected when the Clerk component uses path-based routing. To resolve this error, pass \`routing='path'\` to the <${componentName}/> component, or drop the \`path\` prop to switch to hash-based routing. For more details please refer to our docs: https://clerk.com/docs`;
    var import_react4 = require_react2();
    var useAssertWrappedByClerkProvider = (source) => {
      (0, import_react4.useAssertWrappedByClerkProvider)(() => {
        errorThrower.throwMissingClerkProviderError({ source });
      });
    };
    function useDerivedAuth(authObject, { treatPendingAsSignedOut = true } = {}) {
      const { userId, orgId, orgRole, has, signOut, getToken, orgPermissions, factorVerificationAge, sessionClaims } = authObject != null ? authObject : {};
      const derivedHas = (0, import_react5.useCallback)(
        (params) => {
          if (has) {
            return has(params);
          }
          return (0, import_authorization.createCheckAuthorization)({
            userId,
            orgId,
            orgRole,
            orgPermissions,
            factorVerificationAge,
            features: (sessionClaims == null ? void 0 : sessionClaims.fea) || "",
            plans: (sessionClaims == null ? void 0 : sessionClaims.pla) || ""
          })(params);
        },
        [has, userId, orgId, orgRole, orgPermissions, factorVerificationAge]
      );
      const payload = (0, import_authorization.resolveAuthState)({
        authObject: {
          ...authObject,
          getToken,
          signOut,
          has: derivedHas
        },
        options: {
          treatPendingAsSignedOut
        }
      });
      if (!payload) {
        return errorThrower.throw(invalidStateError);
      }
      return payload;
    }
    var import_react6 = __toESM(require_react());
    var import_react7 = require_react2();
    var import_telemetry2 = require_telemetry();
    var import_react8 = require_react2();
    var import_telemetry3 = require_telemetry();
    var import_react9 = require_react2();
    var import_react10 = __toESM(require_react());
    var withClerk = (Component, displayNameOrOptions) => {
      const passedDisplayedName = typeof displayNameOrOptions === "string" ? displayNameOrOptions : displayNameOrOptions == null ? void 0 : displayNameOrOptions.component;
      const displayName = passedDisplayedName || Component.displayName || Component.name || "Component";
      Component.displayName = displayName;
      const options = typeof displayNameOrOptions === "string" ? void 0 : displayNameOrOptions;
      const HOC = (props) => {
        useAssertWrappedByClerkProvider(displayName || "withClerk");
        const clerk = useIsomorphicClerkContext();
        if (!clerk.loaded && !(options == null ? void 0 : options.renderWhileLoading)) {
          return null;
        }
        return /* @__PURE__ */ import_react10.default.createElement(
          Component,
          {
            ...props,
            component: displayName,
            clerk
          }
        );
      };
      HOC.displayName = `withClerk(${displayName})`;
      return HOC;
    };
    var RedirectToSignIn = withClerk(({ clerk, ...props }) => {
      const { client, session } = clerk;
      const hasSignedInSessions = client.signedInSessions ? client.signedInSessions.length > 0 : (
        // Compat for clerk-js<5.54.0 (which was released with the `signedInSessions` property)
        client.activeSessions && client.activeSessions.length > 0
      );
      import_react11.default.useEffect(() => {
        if (session === null && hasSignedInSessions) {
          void clerk.redirectToAfterSignOut();
        } else {
          void clerk.redirectToSignIn(props);
        }
      }, []);
      return null;
    }, "RedirectToSignIn");
    var RedirectToSignUp = withClerk(({ clerk, ...props }) => {
      import_react11.default.useEffect(() => {
        void clerk.redirectToSignUp(props);
      }, []);
      return null;
    }, "RedirectToSignUp");
    var RedirectToUserProfile = withClerk(({ clerk }) => {
      import_react11.default.useEffect(() => {
        (0, import_deprecated.deprecated)("RedirectToUserProfile", "Use the `redirectToUserProfile()` method instead.");
        void clerk.redirectToUserProfile();
      }, []);
      return null;
    }, "RedirectToUserProfile");
    var RedirectToOrganizationProfile = withClerk(({ clerk }) => {
      import_react11.default.useEffect(() => {
        (0, import_deprecated.deprecated)("RedirectToOrganizationProfile", "Use the `redirectToOrganizationProfile()` method instead.");
        void clerk.redirectToOrganizationProfile();
      }, []);
      return null;
    }, "RedirectToOrganizationProfile");
    var RedirectToCreateOrganization = withClerk(({ clerk }) => {
      import_react11.default.useEffect(() => {
        (0, import_deprecated.deprecated)("RedirectToCreateOrganization", "Use the `redirectToCreateOrganization()` method instead.");
        void clerk.redirectToCreateOrganization();
      }, []);
      return null;
    }, "RedirectToCreateOrganization");
    var AuthenticateWithRedirectCallback = withClerk(
      ({ clerk, ...handleRedirectCallbackParams }) => {
        import_react11.default.useEffect(() => {
          void clerk.handleRedirectCallback(handleRedirectCallbackParams);
        }, []);
        return null;
      },
      "AuthenticateWithRedirectCallback"
    );
    var MultisessionAppSupport = ({ children }) => {
      useAssertWrappedByClerkProvider("MultisessionAppSupport");
      const session = (0, import_react2.useSessionContext)();
      return /* @__PURE__ */ import_react11.default.createElement(import_react11.default.Fragment, { key: session ? session.id : "no-users" }, children);
    };
    function useRoutingProps(componentName, props, routingOptions) {
      const path = props.path || (routingOptions == null ? void 0 : routingOptions.path);
      const routing = props.routing || (routingOptions == null ? void 0 : routingOptions.routing) || "path";
      if (routing === "path") {
        if (!path) {
          return errorThrower.throw(noPathProvidedError(componentName));
        }
        return {
          ...routingOptions,
          ...props,
          routing: "path"
        };
      }
      if (props.path) {
        return errorThrower.throw(incompatibleRoutingWithPathProvidedError(componentName));
      }
      return {
        ...routingOptions,
        ...props,
        path: void 0
      };
    }
    var import_loadClerkJsScript = require_loadClerkJsScript();
  }
});

// ../node_modules/@clerk/remix/dist/client/usePathnameWithoutSplatRouteParams.js
var require_usePathnameWithoutSplatRouteParams = __commonJS({
  "../node_modules/@clerk/remix/dist/client/usePathnameWithoutSplatRouteParams.js"(exports, module) {
    "use strict";
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS2 = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
    var usePathnameWithoutSplatRouteParams_exports = {};
    __export(usePathnameWithoutSplatRouteParams_exports, {
      usePathnameWithoutSplatRouteParams: () => usePathnameWithoutSplatRouteParams
    });
    module.exports = __toCommonJS2(usePathnameWithoutSplatRouteParams_exports);
    var import_react = (init_esm(), __toCommonJS(esm_exports));
    var usePathnameWithoutSplatRouteParams = () => {
      const params = (0, import_react.useParams)();
      const { pathname } = (0, import_react.useLocation)();
      const splatRouteParam = params["*"] || "";
      const path = pathname.replace(splatRouteParam, "").replace(/\/$/, "").replace(/^\//, "").trim();
      return `/${path}`;
    };
  }
});

// ../node_modules/@clerk/remix/dist/client/uiComponents.js
var require_uiComponents = __commonJS({
  "../node_modules/@clerk/remix/dist/client/uiComponents.js"(exports, module) {
    "use strict";
    var __create = Object.create;
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __getProtoOf = Object.getPrototypeOf;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
      // If the importer is in node compatibility mode or this is not an ESM
      // file that has been converted to a CommonJS file using a Babel-
      // compatible transform (i.e. "__esModule" has not been set), then set
      // "default" to the CommonJS "module.exports" for node compatibility.
      isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
      mod
    ));
    var __toCommonJS2 = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
    var uiComponents_exports = {};
    __export(uiComponents_exports, {
      OrganizationProfile: () => OrganizationProfile2,
      SignIn: () => SignIn2,
      SignUp: () => SignUp2,
      UserProfile: () => UserProfile2
    });
    module.exports = __toCommonJS2(uiComponents_exports);
    var import_clerk_react = require_dist2();
    var import_internal = require_internal2();
    var import_react = __toESM(require_react());
    var import_usePathnameWithoutSplatRouteParams = require_usePathnameWithoutSplatRouteParams();
    var UserProfile2 = Object.assign(
      (props) => {
        const path = (0, import_usePathnameWithoutSplatRouteParams.usePathnameWithoutSplatRouteParams)();
        return /* @__PURE__ */ import_react.default.createElement(import_clerk_react.UserProfile, { ...(0, import_internal.useRoutingProps)("UserProfile", props, { path }) });
      },
      { ...import_clerk_react.UserProfile }
    );
    var OrganizationProfile2 = Object.assign(
      (props) => {
        const path = (0, import_usePathnameWithoutSplatRouteParams.usePathnameWithoutSplatRouteParams)();
        return /* @__PURE__ */ import_react.default.createElement(import_clerk_react.OrganizationProfile, { ...(0, import_internal.useRoutingProps)("OrganizationProfile", props, { path }) });
      },
      { ...import_clerk_react.OrganizationProfile }
    );
    var SignIn2 = (props) => {
      const path = (0, import_usePathnameWithoutSplatRouteParams.usePathnameWithoutSplatRouteParams)();
      return /* @__PURE__ */ import_react.default.createElement(import_clerk_react.SignIn, { ...(0, import_internal.useRoutingProps)("SignIn", props, { path }) });
    };
    var SignUp2 = (props) => {
      const path = (0, import_usePathnameWithoutSplatRouteParams.usePathnameWithoutSplatRouteParams)();
      return /* @__PURE__ */ import_react.default.createElement(import_clerk_react.SignUp, { ...(0, import_internal.useRoutingProps)("SignUp", props, { path }) });
    };
  }
});

// ../node_modules/@clerk/remix/dist/client/index.js
var require_client = __commonJS({
  "../node_modules/@clerk/remix/dist/client/index.js"(exports, module) {
    "use strict";
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
    var __toCommonJS2 = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
    var client_exports = {};
    __export(client_exports, {
      ClerkApp: () => import_ClerkApp.ClerkApp,
      OrganizationProfile: () => import_uiComponents.OrganizationProfile,
      SignIn: () => import_uiComponents.SignIn,
      SignUp: () => import_uiComponents.SignUp,
      UserProfile: () => import_uiComponents.UserProfile,
      WithClerkState: () => import_types.WithClerkState
    });
    module.exports = __toCommonJS2(client_exports);
    __reExport(client_exports, require_RemixClerkProvider(), module.exports);
    var import_ClerkApp = require_ClerkApp();
    var import_types = require_types2();
    var import_uiComponents = require_uiComponents();
  }
});

// ../node_modules/@clerk/remix/dist/index.js
var require_dist3 = __commonJS({
  "../node_modules/@clerk/remix/dist/index.js"(exports, module) {
    "use strict";
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
    var __toCommonJS2 = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
    var index_exports = {};
    module.exports = __toCommonJS2(index_exports);
    var import_globalPolyfill = require_globalPolyfill();
    __reExport(index_exports, require_client(), module.exports);
    var import_internal = require_internal2();
    (0, import_internal.setErrorThrowerOptions)({ packageName: "@clerk/remix" });
  }
});

export {
  require_dist3 as require_dist
};
/*! Bundled license information:

use-sync-external-store/cjs/use-sync-external-store-shim.development.js:
  (**
   * @license React
   * use-sync-external-store-shim.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
//# sourceMappingURL=/build/_shared/chunk-ZKF6SCAC.js.map
