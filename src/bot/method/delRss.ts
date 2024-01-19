import { array2text } from "@/utils";
import { CommandContext } from "../utils";
import { deleteRssById } from "@/model";

export const delRss = async (ctx: CommandContext) => {
  const splitd = ctx.update.message.text.split(" ");

  if (splitd.length != 2) {
    ctx.reply(
      array2text(["输入有误，请携带一个参数", "", "用法:", "/delrss <id>"])
    );

    return;
  }

  const id = Number(splitd[1]);

  const result = await deleteRssById(id);

  ctx.reply(
    array2text([`已删除RSS`, "", `ID: ${result.id}`, `名称: ${result.name}`])
  );
};
