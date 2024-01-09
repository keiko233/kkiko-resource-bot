import cron from "node-cron";
import { rss } from "./rss";

export const initCron = () => {
  cron.schedule("*/5 * * * *", () => {
    rss();
  });
};
