import { resourceSave } from "@/manager/resourceSave";
import { createTask, getAllRss, getTaskByUrl } from "@/model";
import { Extract, consola, downloadFileToBuffer, rssRegex } from "@/utils";
import { ofetch } from "ofetch";
import parseTorrent from "parse-torrent";
import { ElementCompact, xml2js } from "xml-js";

const LOGTAG = "[Cron/rss]";

export const rss = async () => {
  const allrss = await getAllRss();

  allrss.forEach(async (r) => {
    const response: ElementCompact = xml2js(await ofetch(r.url), {
      compact: true,
    });

    const rss = rssRegex(response.rss);

    if (rss.length != JSON.parse(r.regex).length) {
      rss.forEach(async (rssItem) => {
        const result = await getTaskByUrl(rssItem.url);

        if (result) {
          consola.info(LOGTAG, `Downloaded (${rssItem.url})`);
        } else {
          consola.info(LOGTAG, `New Item (${rssItem.url})`);

          const buffer = await downloadFileToBuffer(rssItem.url);

          const torrentInfo = parseTorrent(buffer);

          const extract = new Extract();

          await extract.regex(torrentInfo.name as string);

          const task = await createTask({
            url: rssItem.url,
            requestUser: r.requestUser,
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
        }
      });
    } else {
      consola.info(LOGTAG, `No Update (ID: ${r.id})`);
    }
  });
};
