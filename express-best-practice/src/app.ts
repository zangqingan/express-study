import express from 'express';
import pinoHttp from 'pino-http';
import dotenv from 'dotenv';

import logger, { httpLogger, generateRequestId } from "./utils/logger";
import routes from "./routes/index";

// 配置环境变量 proce
dotenv.config();

const server = express();
const port = process.env.APP_PORT || 3000;
const publicPath = new URL("./public", import.meta.url).pathname;

// ---------- 请求 ID 中间件（必须在最前面） ----------
server.use((req, _res, next) => {
  const requestId = generateRequestId();
  req.requestId = requestId;
  next();
});

// ---------- HTTP 请求日志中间件 ----------
server.use(
  pinoHttp({
    logger: httpLogger,
    // 从上游中间件获取 requestId
    genReqId: (req) => req.requestId,
    // 自定义日志格式
    customLogLevel: (_req, res, err) => {
      if (err || res.statusCode >= 500) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
    // 成功时只记录关键信息
    customSuccessMessage: (req, res) =>
      `${req.method} ${req.url} completed`,
    customErrorMessage: (_req, res, err) =>
      `${err.message} (status ${res.statusCode})`,
    // 序列化 req/res，精简输出
    serializers: {
      req: (req) => ({
        method: req.method,
        url: req.url,
        requestId: req.requestId,
      }),
      res: (res) => ({
        statusCode: res.statusCode,
      }),
      err: (err) => ({
        message: err.message,
        stack: err.stack,
      }),
    },
    // 不对健康检查端点打日志
    autoLogging: { ignore: (req) => req.url === "/health" },
  })
);

// 定义一个启动函数并执行
async function bootstrap() {
  server.use(express.static(publicPath));
  server.use(express.json());

  // 挂载路由
  server.use("/api", routes);

  // 健康检查端点（不会被 pino-http 记录日志）
  server.get("/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  await server.listen(port);
  logger.info({ port }, "Server started");

  process.on("uncaughtException", (err) => {
    logger.fatal({ err }, "uncaughtException");
    process.exit(1);
  });

  process.on("unhandledRejection", (reason) => {
    logger.error({ reason }, "unhandledRejection");
  });
}
bootstrap();
