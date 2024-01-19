import { getRssByRequestUserId, getRssBySubUserId } from "@/model";
import { CommandContext } from "../utils";
import { array2text, format } from "@/utils";
import dayjs from "dayjs";

export const query24h = async (ctx: CommandContext) => {
  const { id } = ctx.update.message.from;

  const randomId = id + new Date().getTime();

  const rssLists = await getRssByRequestUserId(id);

  rssLists.push(...(await getRssBySubUserId(id)));

  if (rssLists.length == 0) {
    ctx.reply("当前没有订阅，请添加");

    return;
  }

  const updateLists: {
    id: number;
    requestUser: string;
    requestUserId: bigint;
    subUserIds: string;
    name: string;
    url: string;
    regex: string;
    createdAt: Date;
    updatedAt: Date;
    latestAt: Date;
  }[] = [];
  const oneday = 24 * 60 * 60 * 1000;

  rssLists.forEach((list) => {
    const now = new Date().getTime();

    if (
      (list.latestAt || list.updatedAt).getTime() + 7 * oneday - now <
      oneday
    ) {
      updateLists.push(list);
    }
  });

  if (updateLists.length == 0) {
    ctx.reply("24小时内无番剧更新");

    return;
  }

  ctx.reply(
    array2text(
      updateLists.map((update) => {
        const timeLeft = dayjs(
          new Date(update.latestAt || update.updatedAt).getTime() + 7 * oneday
        ).diff(dayjs(new Date().getTime()), "minute");

        return array2text([
          `ID: ${update.id}`,
          `名称: ${update.name}`,
          `上次更新时间: ${format.date(update.latestAt || update.updatedAt)}`,
          `提示: 预计${Math.floor(timeLeft / 60)}小时 ${
            timeLeft % 60
          }分钟后更新`,
          "",
        ]);
      })
    )
  );
};
