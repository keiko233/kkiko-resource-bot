import { getTaskById, updateTaskById } from "@/model";
import {
  Nfo,
  Rename,
  config,
  consola,
  format,
  alist as alistApi,
  deleteFolder,
  delay,
  Strm,
} from "@/utils";
import qbittorrent from "@/utils/qbittorrent";
import { readdirSync } from "fs";
import path from "path";

const LOGTAG = "[manager/resourceSave]";

const log = (msg: string, ...args: any) => {
  consola.info(`${LOGTAG} ${msg}`, ...args);
};

export const resourceSave = async (id: number, torrent: Buffer) => {
  const task = await getTaskById(id);

  const callback = async (msg: string) => {
    log(msg);

    await updateTaskById(task.id, {
      message: msg,
    });
  };

  const qbtask = await qbittorrent.addTorrent(torrent, {
    savepath: `${config.savepath}/task-${id}`,
  });

  if (qbtask) {
    callback("任务添加成功");
  } else {
    callback("任务添加失败");
    throw new Error();
  }

  await delay(3000);

  const metaTorrent = await qbittorrent.getTorrent(task.hash);

  await updateTaskById(task.id, {
    savePath: metaTorrent.savePath,
  });

  const showStatus = async (lastProgress?: string) => {
    const torrent = await qbittorrent.getTorrent(task.hash);

    const progress = (torrent.progress * 100).toFixed(2);

    if (torrent.progress < 1) {
      if (progress != lastProgress) {
        callback(
          `下载进度: ${progress}% (${format.size(
            torrent.totalDownloaded
          )} / ${format.size(torrent.totalSize)})`
        );

        setTimeout(async () => {
          await showStatus(progress);
        }, 3000);
      }
    } else {
      const lastTask = await updateTaskById(task.id, {
        message: `下载完成 (${format.size(torrent.totalSize)})`,
        status: "successfully-downloaded",
      });

      await callback("即将进行重命名");

      await qbittorrent.removeTorrent(task.hash, false);

      const rename = new Rename(
        `${lastTask.savePath}/${lastTask.name}`,
        JSON.parse(task.tmdbDetails),
        JSON.parse(task.tmdbSeasonDetails),
        JSON.parse(task.tmdbEpisodeDetails)
      );

      await rename.run();

      await callback("重命名完成");

      const nfo = new Nfo();

      await callback("正在生成元信息");

      await nfo.getInfo(lastTask.id);

      const generatePath = `${lastTask.savePath}/${rename.tvName}`.substring(1);

      nfo.generateTvshow(generatePath);

      await Promise.all(nfo.saveTvImages(generatePath));

      nfo.generateTvshowSeason(generatePath);

      await Promise.all(
        nfo.saveTvSeasonImages(generatePath, await rename.getFileName())
      );

      const alist = await alistApi;

      const makeUploadTasks = (
        folderPath: string,
        remoteFolderPath: string
      ) => {
        const lists = [];

        const files = readdirSync(folderPath, { withFileTypes: true });

        files.forEach((file) => {
          const filePath = path.join(folderPath, file.name);

          if (file.isDirectory()) {
            lists.push(
              ...makeUploadTasks(
                filePath,
                path.join(remoteFolderPath, file.name)
              )
            );
          } else {
            const remoteFilePath = path.join(remoteFolderPath, file.name);

            log(`upload ${filePath}`);

            lists.push(alist.fs.upload(filePath, remoteFilePath, true));
          }
        });

        return lists;
      };

      await callback("执行上传文件");

      log(
        "上传完成",
        await Promise.all(
          makeUploadTasks(
            generatePath,
            `${config.alist.rootPath}/${rename.tvName}`
          )
        )
      );

      await new Strm().makeStrm(lastTask.savePath.substring(1));

      deleteFolder(generatePath);

      await updateTaskById(task.id, {
        status: "complated",
        message: "处理完成",
      });
    }
  };

  setTimeout(async () => {
    await showStatus();
  }, 3000);
};
