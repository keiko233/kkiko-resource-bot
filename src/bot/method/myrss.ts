import { getRssByRequestUserId, getRssBySubUserId } from "@/model";
import { CommandContext } from "../utils";
import { array2text, format, paginate } from "@/utils";
import { Markup } from "telegraf";
import { bot } from "../common";

export const myrss = async (ctx: CommandContext) => {
  const { id } = ctx.update.message.from;

  const randomId = id + new Date().getTime();

  const rssLists = await getRssByRequestUserId(id);

  rssLists.push(...(await getRssBySubUserId(id)));

  if (rssLists.length == 0) {
    ctx.reply("当前没有订阅，请添加");

    return;
  }

  const page = {
    size: 5,
    number: 1,
  };

  const getPageText = () => {
    return array2text([
      ...paginate(rssLists, page.size, page.number).map((r) => {
        return array2text([
          `ID: ${r.id}`,
          `名称: ${r.name}`,
          `链接: [点击查看](${r.url})`,
          `创建时间: ${format.date(r.createdAt)}`,
          `更新时间: ${format.date(r.latestAt || r.updatedAt)}`,
          "",
        ]);
      }),
      `当前第${page.number}页，共计${Math.ceil(rssLists.length / page.size)}页`,
    ]);
  };

  const getKeyBoard = () => {
    const buttons = [];

    if (page.number > 1) {
      buttons.push(
        Markup.button.callback("上一页", `myrss-previous-${randomId}`)
      );
    }

    if (page.number < Math.ceil(rssLists.length / page.size)) {
      buttons.push(Markup.button.callback("下一页", `myrss-next-${randomId}`));
    }

    return Markup.inlineKeyboard(buttons, {
      columns: 2,
    });
  };

  ctx.reply(getPageText(), {
    ...getKeyBoard(),
    parse_mode: "Markdown",
  });

  bot.action(`myrss-next-${randomId}`, (ctx) => {
    page.number++;

    ctx.editMessageText(getPageText(), {
      ...getKeyBoard(),
      parse_mode: "Markdown",
    });
  });

  bot.action(`myrss-previous-${randomId}`, (ctx) => {
    page.number--;

    ctx.editMessageText(getPageText(), {
      ...getKeyBoard(),
      parse_mode: "Markdown",
    });
  });
};
