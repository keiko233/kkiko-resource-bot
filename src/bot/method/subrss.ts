import { getRssById, getAllRss, updateRssbyId } from "@/model";
import { CommandContext } from "../utils";
import { array2text, format, paginate } from "@/utils";
import { Markup } from "telegraf";
import { bot } from "../common";

export const subrss = async (ctx: CommandContext) => {
  const { id } = ctx.update.message.from;

  const randomId = id + new Date().getTime();

  const rssLists = await getAllRss();

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
          `更新时间: ${format.date(r.updatedAt)}`,
          "",
        ]);
      }),
      `当前第${page.number}页，共计${Math.ceil(rssLists.length / page.size)}页`,
    ]);
  };

  const getKeyBoard = () => {
    const buttons = paginate(rssLists, page.size, page.number).map((r) => {
      const buttonId = `subrss-sub-${randomId}-${r.id}`;

      bot.action(buttonId, async (ctx) => {
        const userRss = await getRssById(r.id);

        const subUserIds: number[] = JSON.parse(userRss.subUserIds || "[]");

        if (Number(userRss.requestUserId) == id) {
          ctx.reply(`此条订阅是你创建的，无需订阅 (${r.id})`);
          return;
        }

        if (subUserIds.includes(id)) {
          ctx.reply(`已订阅 ${r.name}，无法再次订阅 (${r.id})`);
          return;
        }

        subUserIds.push(id);

        await updateRssbyId(userRss.id, {
          subUserIds: JSON.stringify(subUserIds),
        });

        ctx.reply(`订阅 ${r.name} 成功！ (${r.id})`);
      });

      return Markup.button.callback(`订阅 ${r.name}`, buttonId);
    });

    if (page.number > 1) {
      buttons.push(
        Markup.button.callback("上一页", `subrss-previous-${randomId}`)
      );
    }

    if (page.number < Math.ceil(rssLists.length / page.size)) {
      buttons.push(Markup.button.callback("下一页", `subrss-next-${randomId}`));
    }

    return Markup.inlineKeyboard(buttons, {
      columns: 1,
    });
  };

  ctx.reply(getPageText(), {
    ...getKeyBoard(),
    parse_mode: "Markdown",
  });

  bot.action(`subrss-next-${randomId}`, (ctx) => {
    page.number++;

    ctx.editMessageText(getPageText(), {
      ...getKeyBoard(),
      parse_mode: "Markdown",
    });
  });

  bot.action(`subrss-previous-${randomId}`, (ctx) => {
    page.number--;

    ctx.editMessageText(getPageText(), {
      ...getKeyBoard(),
      parse_mode: "Markdown",
    });
  });
};
