import { copyFileSync } from "fs";
import { traverseDirectory, alist as alistApi, config, consola } from ".";
import { onedrive } from "./onedrive";

export const uploadTmpDir = async (rootDir: string) => {
  const files = traverseDirectory(rootDir);

  const alist = await alistApi;

  const tasks = [];

  files.forEach((file) => {
    const uploadPath = file.replace(new RegExp(rootDir, "g"), "").substring(1);

    consola.info("[utils/upload]", file);

    copyFileSync(
      file,
      `${config.strm.path}${config.alist.rootPath}/${uploadPath}`
    );

    if (config.uploadDrive == "alist") {
      tasks.push(
        alist.fs.upload(file, `${config.alist.rootPath}/${uploadPath}`, true)
      );
    } else {
      tasks.push(
        onedrive.file.upload(file, `${config.onedrive.rootPath}/${uploadPath}`)
      );
    }
  });

  await Promise.all(tasks);
};
