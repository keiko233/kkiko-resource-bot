import { array2text } from "@/utils";
import { CommandContext } from "../utils";
import { updateRssbyId } from "@/model";

export const renameRss = async (ctx: CommandContext) => {
  const splitd = ctx.update.message.text.split(" ");

  if (splitd.length != 3) {
    ctx.reply(
      array2text([
        "输入有误，请携带两个参数",
        "",
        "用法:",
        "/renamerss <id> <name>",
      ])
    );

    return;
  }

  const id = Number(splitd[1]);

  const name = splitd[2];

  const result = await updateRssbyId(id, {
    name,
  });

  ctx.reply(
    array2text([`更新成功！`, "", `ID: ${result.id}`, `名称: ${result.name}`])
  );
};
