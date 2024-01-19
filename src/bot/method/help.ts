import { array2text } from "@/utils";
import { CommandContext } from "../utils";

export const help = (ctx: CommandContext) => {
  const helpMessage = [
    "欢迎使用资源下载 Bot",
    "",
    "/start 使用帮助",
    "/help 使用帮助",
    "/download 下载torrent",
    "/rss 添加rss订阅",
    "/myrss 查看我的订阅",
    "/renamerss 重命名RSS",
    "/delrss 删除RSS",
    "/subrss 添加已有订阅",
    "/query24h 查看24小时内更新的番剧",
    "/24h 查看24小时内更新的番剧",
  ];

  ctx.reply(array2text(helpMessage));
};
