import { array2text, isLink, rssRegex } from "@/utils";
import { CommandContext } from "../utils";
import { ofetch } from "ofetch";
import { ElementCompact, xml2js } from "xml-js";
import { Markup } from "telegraf";
import { bot } from "../common";
import { createRss } from "@/model";

export const rss = async (ctx: CommandContext) => {
  const randomId = Math.random();

  const splitd = ctx.update.message.text.split(" ");

  if (splitd.length != 2) {
    ctx.reply(
      array2text(["输入有误，请携带一个参数", "", "用法:", "/rss <url>"])
    );

    return;
  }

  const url = splitd[1];

  if (!isLink(url)) {
    ctx.reply("输入有误，请输入正确的链接");

    return;
  }

  const result: ElementCompact = xml2js(await ofetch(url), {
    compact: true,
  });

  if (!result.rss) {
    ctx.reply("RSS解析失败，请检查链接");

    return;
  }

  const rss = rssRegex(result.rss);

  ctx.reply(
    array2text(["RSS解析结果: ", ...rss.map((element) => element.title)]),
    Markup.inlineKeyboard([
      Markup.button.callback(
        "确认无误，添加订阅",
        `download-submit-${randomId}`
      ),
    ])
  );

  bot.action(`download-submit-${randomId}`, async (ctx) => {
    const { first_name, id } = ctx.update.callback_query.from;

    const result = await createRss({
      requestUser: first_name,
      requestUserId: id,
      name: "CustomRss",
      url,
      regex: JSON.stringify(rss),
    });

    if (result) {
      ctx.editMessageText("添加成功！");
    } else {
      ctx.editMessageText("添加失败！");
    }
  });
};
