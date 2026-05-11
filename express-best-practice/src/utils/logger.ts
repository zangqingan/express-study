import pino from "pino";
import path from "path";
import { fileURLToPath } from "url";

// ESM 环境下模拟 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === "production";

const logDir = path.resolve(__dirname, "../../public/logs");

// 构建 transport 目标列表
const targets: pino.TransportTargetOptions[] = [
  // 文件滚动日志（所有环境生效）
  {
    target: "pino-roll",
    options: {
      file: path.join(logDir, "app"),
      frequency: "daily",
      mkdir: true,
      size: "10m",
      limit: { count: 30 },
    },
    level: "info",
  },
];

// 控制台输出：dev 彩色美化，prod JSON 输出
if (isProd) {
  targets.push({
    target: "pino/file",
    options: { destination: 1 },
    level: "warn",
  });
} else {
  targets.push({
    target: "pino-pretty",
    options: { colorize: true, translateTime: "yyyy-mm-dd HH:MM:ss" },
    level: "debug",
  });
}

// 基础 logger（底层实例，不直接导出）
const rootLogger = pino({
  level: process.env.LOG_LEVEL || (isProd ? "info" : "debug"),
  transport: { targets },
  base: isProd ? { pid: process.pid } : { pid: process.pid, hostname: undefined },
});

// ---------- 错误序列化 ----------
// 确保 Error 对象被正确序列化（stack + message）
function errSerializer(err: unknown) {
  if (err instanceof Error) {
    return {
      message: err.message,
      stack: err.stack,
      ...(err as unknown as Record<string, unknown>),
    };
  }
  return err;
}

// ---------- 封装常用方法 ----------
const logger = {
  trace: (obj: Record<string, unknown>, msg?: string) => rootLogger.trace(obj, msg),
  debug: (obj: Record<string, unknown>, msg?: string) => rootLogger.debug(obj, msg),
  info: (obj: Record<string, unknown>, msg?: string) => rootLogger.info(obj, msg),
  warn: (obj: Record<string, unknown>, msg?: string) => rootLogger.warn(obj, msg),
  error: (obj: Record<string, unknown>, msg?: string) => {
    // 自动序列化 err 字段
    if (obj.err) {
      obj.err = errSerializer(obj.err);
    }
    rootLogger.error(obj, msg);
  },
  fatal: (obj: Record<string, unknown>, msg?: string) => {
    if (obj.err) {
      obj.err = errSerializer(obj.err);
    }
    rootLogger.fatal(obj, msg);
  },
  // 创建模块级子 logger（附带模块名）
  child: (bindings: Record<string, unknown>) => rootLogger.child(bindings),
} as const;

export default logger;

// ---------- HTTP 请求日志工具 ----------
// 创建 pino-http 可用的 logger 实例（需要传给 pino-http 构造函数）
export const httpLogger = rootLogger;

// ---------- 请求 ID 生成器 ----------
export function generateRequestId(): string {
  return crypto.randomUUID().slice(0, 8);
}
