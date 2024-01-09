import { array2text, downloadFileToBuffer, isLink, Extract } from "@/utils";
import { CommandContext } from "../utils";
import { Markup } from "telegraf";
import { bot } from "../common";
import { resourceSave } from "@/manager/resourceSave";
import { createTask, getTaskById } from "@/model";
import parseTorrent from "parse-torrent";

export const download = async (ctx: CommandContext) => {
  const event = new BotDownload();

  await event.run(ctx);
};

class BotDownload {
  private extract: Extract;
  private randomId: number;

  constructor() {
    this.randomId = Math.random();
  }

  public async run(ctx: CommandContext) {
    const splitd = ctx.update.message.text.split(" ");

    if (splitd.length != 2) {
      const message = [
        "输入有误，请携带一个参数",
        "",
        "用法:",
        "/download <url>",
      ];

      ctx.reply(array2text(message));

      return;
    }

    const url = splitd[1];

    if (!isLink(url)) {
      ctx.reply("输入有误，请输入正确的链接");

      return;
    }

    const buffer = await downloadFileToBuffer(url);

    if (!buffer) {
      ctx.reply("种子下载失败，请检查连接是否正确");
    }

    const torrentInfo = parseTorrent(buffer);

    ctx.reply(
      array2text([
        `链接: ${url}`,
        `名称: ${torrentInfo.name}`,
        `hash: ${torrentInfo.infoHash}`,
      ]),
      Markup.inlineKeyboard([
        Markup.button.callback(
          "确认无误，下一步",
          `download-next-${this.randomId}`
        ),
      ])
    );

    this.extract = new Extract();

    bot.action(`download-next-${this.randomId}`, async (ctx) => {
      await this.extract.regex(torrentInfo.name as string);

      ctx.editMessageText(
        array2text([
          "解析结果: ",
          `标题: ${this.extract.regexName}`,
          `季度: ${this.extract.season}`,
          `集数: ${this.extract.episode}`,
          "",
          "搜索结果: ",
          `名称: ${this.extract.tmdbDetails.name}`,
          `季度: ${this.extract.tmdbSeasonDetails.name}`,
          `集数信息: ${this.extract.tmdbEpisodeDetails.name}`,
          `TMDB ID: ${this.extract.tmdbDetails.id}`,
        ]),
        Markup.inlineKeyboard([
          Markup.button.callback(
            "确认无误，下发任务",
            `download-submit-${this.randomId}`
          ),
        ])
      );
    });

    bot.action(`download-submit-${this.randomId}`, async (ctx) => {
      const { first_name, id } = ctx.update.callback_query.from;

      const task = await createTask({
        url,
        requestUser: first_name,
        requestUserId: id,
        status: "pending",
        message: "任务已下发，执行中，等待回调",
        hash: torrentInfo.infoHash,
        name: torrentInfo.name as string,
        tmdbId: this.extract.tmdbDetails.id,
        tmdbDetails: JSON.stringify(this.extract.tmdbDetails),
        tmdbSeasonDetails: JSON.stringify(this.extract.tmdbSeasonDetails),
        tmdbEpisodeDetails: JSON.stringify(this.extract.tmdbEpisodeDetails),
      });

      resourceSave(task.id, buffer);

      let oldMessage = task.message;

      ctx.editMessageText(task.message);

      const interval = setInterval(async () => {
        const newtask = await getTaskById(task.id);

        if (oldMessage != newtask.message) {
          oldMessage = newtask.message;

          ctx.editMessageText(
            array2text([
              `ID: ${newtask.id}`,
              `名称: ${newtask.name || "获取中"}`,
              `Hash: ${newtask.hash || "获取中"}`,
              `状态: ${newtask.status}`,
              `消息: ${newtask.message}`,
            ])
          );
        }

        if (newtask.status == "complated") {
          clearInterval(interval);
        }
      }, 3000);
    });
  }
}
