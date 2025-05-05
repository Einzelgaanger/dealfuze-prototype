import { createRequestHandler } from "@remix-run/express";
import express from "express";
import compression from "compression";
import morgan from "morgan";
import { createServer } from "node:http";

const app = express();
const port = process.env.PORT || 3000;

app.use(compression());
app.use(morgan("tiny"));
app.use(express.static("public"));

// Handle all other routes with Remix
app.all(
  "*",
  createRequestHandler({
    build: require("./build"),
    mode: process.env.NODE_ENV,
  })
);

const httpServer = createServer(app);

httpServer.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
}); 