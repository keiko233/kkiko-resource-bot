import consola from "consola";
import { cmdMap } from "./bot";
import { bot } from "./bot/common";
import { initCron } from "./cron";

cmdMap.forEach((item) => {
  bot.command(item.cmd, item.func);
});

const lunch = () => {
  try {
    bot.launch();

    consola.success("Bot lunch completed");
  } catch (err) {
    consola.error("Bot lunch failed");

    throw new Error(err);
  }
};

lunch();
initCron();
