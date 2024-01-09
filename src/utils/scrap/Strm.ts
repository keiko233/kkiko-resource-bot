import { copyFileSync, writeFileSync } from "fs";
import { config } from "../config";
import { createFolderRecursive, traverseDirectory } from "../file";
import { consola } from "../logger";

const LOGTAG = "[scrap/Strm]";

const log = (msg: string, ...args: any) => {
  consola.info(`${LOGTAG} ${msg}`, ...args);
};

export class Strm {
  private files: string[];
  private alistRootPath = config.alist.rootPath.substring(1);

  private getStrmPath(file: string) {
    const strm = file.split("/");

    strm.shift();
    strm.shift();

    return `${config.strm.path}/${this.alistRootPath}/${strm.join("/")}`;
  }

  public async makeStrm(dir: string) {
    this.files = await traverseDirectory(dir);

    this.files.forEach((file) => {
      const strm = file.split("/");

      strm.shift();
      strm.shift();
      strm.pop();

      createFolderRecursive(
        `${config.strm.path}/${this.alistRootPath}/${strm.join("/")}`
      );

      if (/\.(mkv|mp4|mov)$/.test(file)) {
        console.log("video", file);

        const getUrl = () => {
          const strm = file.split("/");

          strm.shift();
          strm.shift();

          return `${config.strm.baseURL}${this.alistRootPath}/${strm.join(
            "/"
          )}`;
        };

        const writeStrmFile = (text: string) => {
          const filePathSplit = this.getStrmPath(file).split(".");

          filePathSplit.pop();

          filePathSplit.push("strm");

          const finallyFilePath = filePathSplit.join(".");

          log(`writeStrm: ${finallyFilePath}`);

          writeFileSync(finallyFilePath, text);
        };

        writeStrmFile(getUrl());
      } else {
        const target = this.getStrmPath(file);

        log(`copyFile: ${target}`);

        copyFileSync(file, target);
      }
    });
  }
}
