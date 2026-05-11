import { Router } from "express";
import logger from "../utils/logger.js";

const router = Router();

// 为路由模块创建子 logger，附带模块名
const routeLogger = logger.child({ module: "routes" });

router.get("/hello", (_req, res) => {
  routeLogger.info({}, "Handling /hello request");
  res.json({ message: "Hello from Express Best Practice!" });
});

// 演示错误日志
router.get("/error-demo", (_req, res) => {
  const err = new Error("演示错误");
  try {
    throw err;
  } catch (e) {
    routeLogger.error({ err: e as Error }, "Caught error in /error-demo demo");
  }
  res.status(500).json({ error: "Internal demo error" });
});

export default router;
