import { array2text, config, consola } from "../utils";
import { Context } from "telegraf";
import { Message, Update } from "telegraf/typings/core/types/typegram";

export const botLogger = async (
  ctx: CommandContext,
  next: () => Promise<void>
) => {
  const start = Date.now();

  const message =
    ctx.update.message ||
    ctx.update.callback_query ||
    ctx.update.edited_message;

  const text = [
    `UserID: ${message.from.id}`,
    `UserName: ${message.from.first_name}`,
    `Text: ${message.text}`,
  ];

  if (verifyUser(message.from.id)) {
    await next();
  } else {
    text.push("Unauthorized user");
    
    ctx.reply("Unauthorized user");
  }

  const ms = Date.now() - start;

  text.push(`(${ms}ms)`);

  consola.info(array2text(text, "space"));
};

const verifyUser = (id: number) => {
  return config.users.includes(id);
};

export interface CommandContext
  extends Context<{
    edited_message?: never;
    callback_query?: never;
    message: Update.New & Update.NonChannel & Message.TextMessage;
    update_id: number;
  }> {}
