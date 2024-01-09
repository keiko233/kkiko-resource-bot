import { Context, Markup, Middleware, Telegraf } from "telegraf";
import { config } from "../utils";
import { Update } from "telegraf/typings/core/types/typegram";
import { botLogger } from "../middleware";

export const bot: Telegraf<Context<Update>> = new Telegraf(config.token);

bot.use(botLogger as Middleware<Context<Update>>);
