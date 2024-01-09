import { $Fetch } from "ofetch";
import { useRequest, Response } from "./utils";
import { createReadStream } from "fs";
import mime from "mime";

export class Fs {
  private request: $Fetch;

  constructor(token: string) {
    this.request = useRequest(token);
  }

  public async upload(
    filePath: string,
    uploadPath: string,
    asTask: boolean = false
  ) {
    const quest = await this.request<Response<null>>("/fs/put", {
      method: "PUT",
      headers: {
        "Content-Type": mime.getType(filePath) || "application/octet-stream",
        "As-Task": String(asTask),
        "File-Path": encodeURIComponent(uploadPath),
      },
      body: createReadStream(filePath),
    });

    return quest;
  }
}
