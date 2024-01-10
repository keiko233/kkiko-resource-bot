import { writeFileSync } from "fs";
import { config } from "../config";
import { createFolderRecursive } from "../file";
import { consola } from "../logger";

const LOGTAG = "[scrap/Strm]";

const log = (msg: string, ...args: any) => {
  consola.info(`${LOGTAG} ${msg}`, ...args);
};

export const makeStrm = (videoPath: string) => {
  const url = `${config.strm.baseURL}${videoPath}`;

  const filePath = `${config.strm.path}${config.alist.rootPath}/${videoPath.replace(
    /\.(mkv|mp4|mov)$/gi,
    ".strm"
  )}`;

  const createFolder = () => {
    const dirs = filePath.split("/");

    dirs.pop();

    createFolderRecursive(dirs.join("/"));
  };

  createFolder();

  log(`writeStrm: ${filePath}`);

  writeFileSync(filePath, url);
};
