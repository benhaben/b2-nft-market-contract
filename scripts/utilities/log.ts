import log4js from "log4js"
export const logger = log4js.getLogger()
logger.level = "info"
log4js.configure({
  appenders: {
    out: { type: "stdout" },
    everything: { type: "file", filename: "b2.log", maxLogSize: 104857600, backups: 3, compress: true },
  },
  categories: {
    default: { appenders: ["everything", "out"], level: "debug" },
  },
})

export function safeExitLog() {
  log4js.shutdown()
  process.exit(0)
}
