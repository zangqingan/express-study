// 让此文件被视为模块（verbatimModuleSyntax 要求）
export {};

declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}
