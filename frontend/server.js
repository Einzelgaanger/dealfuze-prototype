import { createRequestHandler } from "@remix-run/express";
import express from "express";
import compression from "compression";
import morgan from "morgan";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { readFileSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const build = JSON.parse(readFileSync(new URL("./build/index.js", import.meta.url), "utf-8"));

const app = express();
const port = process.env.PORT || 3000;

app.use(compression());
app.use(morgan("tiny"));
app.use(express.static("public"));

// Handle all other routes with Remix
app.all(
  "*",
  createRequestHandler({
    build,
    mode: process.env.NODE_ENV,
  })
);

const httpServer = createServer(app);

httpServer.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
}); 