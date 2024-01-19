import { createReadStream, statSync } from "fs";
import oneDriveAPI from "onedrive-api";
import { consola } from "../logger";
import { config } from "../config";

export class File {
  private accessToken: string;

  constructor(token: string) {
    this.accessToken = token;
  }

  public async upload(filePath: string, filename: string) {
    const fileSize = statSync(filePath).size;

    try {
      const result = await oneDriveAPI.items.uploadSession({
        accessToken: this.accessToken,
        filename,
        fileSize,
        readableStream: createReadStream(filePath),
        chunksToUpload: config.onedrive.chunksToUpload,
      });

      if (result) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      consola.error(error);
    }
  }
}
