import { getTaskById, updateTaskById } from "@/model";
import {
  Nfo,
  Rename,
  config,
  consola,
  format,
  deleteFolder,
  delay,
} from "@/utils";
import qbittorrent from "@/utils/qbittorrent";
import { uploadTmpDir } from "@/utils/upload";

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

      await callback("准备上传视频并重命名");

      const rename = new Rename(lastTask);
      await rename.run();

      await callback("正在生成元信息");

      const nfo = new Nfo();
      await nfo.run(lastTask, rename.tvName);

      await qbittorrent.removeTorrent(lastTask.hash, false);

      await uploadTmpDir(`tmp/task-${lastTask.id}`);

      deleteFolder(`tmp/task-${lastTask.id}`);

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
