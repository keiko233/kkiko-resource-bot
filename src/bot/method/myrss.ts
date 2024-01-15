import { getRssByRequestUserId } from "@/model";
import { CommandContext } from "../utils";
import { array2text, format } from "@/utils";

export const myrss = async (ctx: CommandContext) => {
  const { id } = ctx.update.message.from;

  const rssLists = await getRssByRequestUserId(id);

  ctx.replyWithMarkdown(
    array2text(
      rssLists.map((r) => {
        return array2text([
          `ID: ${r.id}`,
          `名称: ${r.name}`,
          `链接: [点击查看](${r.url})`,
          `创建时间: ${format.date(r.createdAt)}`,
          `更新时间: ${format.date(r.updatedAt)}`,
          "",
        ]);
      })
    )
  );
};
