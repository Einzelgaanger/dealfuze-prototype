import { pino } from "pino";

const transport = pino.transport({
  targets: [
    {
      target: "pino/file",
      options: { destination: `./app.log` },
    },

    {
      target: "pino-pretty",
      level: "info",
      options: {
        colorize: true,
        ignore: "pid,hostname,time",
        messageFormat: "{msg}",
        minimumLevel: "info",
      },
    },
  ],
});

export default pino(
  {
    level: "trace",
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  transport
);
