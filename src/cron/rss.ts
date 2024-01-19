import { resourceSave } from "@/manager/resourceSave";
import { createTask, getAllRss, getTaskById, updateRssbyId } from "@/model";
import {
  Extract,
  Rss,
  array2text,
  consola,
  downloadFileToBuffer,
  rssRegex,
} from "@/utils";
import { ofetch } from "ofetch";
import parseTorrent from "parse-torrent";
import { ElementCompact, xml2js } from "xml-js";
import { differenceBy } from "lodash";
import { bot } from "@/bot/common";

const LOGTAG = "[Cron/rss]";

const toDownload = async (
  item: Rss.RegexRss,
  r: {
    requestUser: string;
    requestUserId: bigint;
    subUserIds: string;
  }
) => {
  const buffer = await downloadFileToBuffer(item.url);

  const torrentInfo = parseTorrent(buffer);

  const extract = new Extract();

  await extract.regex(torrentInfo.name as string);

  const task = await createTask({
    url: item.url,
    requestUser: r.requestUser + "(RssToggle)",
    requestUserId: Number(r.requestUserId),
    status: "pending",
    message: "任务已下发，执行中，等待回调",
    hash: torrentInfo.infoHash,
    name: torrentInfo.name as string,
    tmdbId: extract.tmdbDetails.id,
    tmdbDetails: JSON.stringify(extract.tmdbDetails),
    tmdbSeasonDetails: JSON.stringify(extract.tmdbSeasonDetails),
    tmdbEpisodeDetails: JSON.stringify(extract.tmdbEpisodeDetails),
  });

  resourceSave(task.id, buffer);

  const message = (task: {
    id: number;
    status: string;
    message: string;
    name: string;
    hash: string;
  }) => {
    return array2text([
      "订阅的番剧更新啦~",
      `标题: ${item.title}`,
      "",
      "任务详细：",
      `ID: ${task.id}`,
      `名称: ${task.name || "获取中"}`,
      `Hash: ${task.hash || "获取中"}`,
      `状态: ${task.status}`,
      `消息: ${task.message}`,
    ]);
  };

  const ctx = await bot.telegram.sendMessage(
    Number(r.requestUserId),
    message(task)
  );

  let oldMessage: string;

  const interval = setInterval(async () => {
    const newtask = await getTaskById(task.id);

    if (oldMessage != newtask.message) {
      oldMessage = newtask.message;

      bot.telegram.editMessageText(
        Number(r.requestUserId),
        ctx.message_id,
        "any",
        message(newtask)
      );

      if (newtask.status == "successfully-downloaded") {
        if (r.subUserIds && r.subUserIds != "[]") {
          const users: number[] = JSON.parse(r.subUserIds);
          
          consola.log(LOGTAG, "Send Update Message to subUserIds: ", users)

          users.forEach(async (user) => {
            await bot.telegram.sendMessage(user, array2text([
              "订阅的番剧更新啦~",
              `标题: ${item.title}`,
            ]));
          });
        }
      }
    }

    if (newtask.status == "complated") {
      clearInterval(interval);
    }
  }, 3000);
};

export const rss = async () => {
  const allrss = await getAllRss();

  allrss.forEach(async (r) => {
    consola.info(LOGTAG, `Check Rss: ${decodeURI(r.url)} (ID: ${r.id})`);

    const response: ElementCompact = xml2js(await ofetch(r.url), {
      compact: true,
    });

    const rss = rssRegex(response.rss);

    const rssDifference = differenceBy(rss, JSON.parse(r.regex), "url");

    if (rssDifference.length > 0) {
      rssDifference.forEach(async (item) => {
        consola.info(LOGTAG, `New Item: ${item.title} ${decodeURI(item.url)}`);

        toDownload(item, r);

        updateRssbyId(r.id, { regex: JSON.stringify(rss) });
      });
    } else {
      consola.info(LOGTAG, `No Update: ${decodeURI(r.url)} (ID: ${r.id})`);
    }
  });
};
