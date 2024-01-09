import * as fs from "fs";
import { consola } from "./logger";

const LOGTAG = "[regex/Rename]";

export const createFolderRecursive = (folderPath: string): void => {
  const folders = folderPath.split("/");

  let currentPath = "";

  folders.forEach((folder) => {
    currentPath += folder + "/";
    if (!fs.existsSync(currentPath)) {
      fs.mkdirSync(currentPath);
      consola.success(LOGTAG, `Floder ${currentPath} created.`);
    } else {
      consola.info(LOGTAG, `Floder ${currentPath} already exists`);
    }
  });
};

export const deleteFolder = (folderPath: string) => {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const filePath = `${folderPath}/${file}`;

      if (fs.lstatSync(filePath).isDirectory()) {
        deleteFolder(filePath);
      } else {
        fs.unlinkSync(filePath);

        consola.info(LOGTAG, `Deleted file: ${filePath}`);
      }
    });

    fs.rmdirSync(folderPath);

    consola.info(LOGTAG, `Deleted folder: ${folderPath}`);
  } else {
    consola.error(LOGTAG, `Folder does not exist: ${folderPath}`);
  }
};
