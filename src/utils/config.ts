import { readFileSync } from "fs";

export interface Config {
  token: string;
  qbitorrent: {
    baseUrl: string;
    username: string;
    password: string;
  };
  savepath: string;
  tmdb: {
    api_key: string;
    access_token: string;
  };
  alist: {
    baseURL: string;
    username: string;
    password: string;
    rootPath: string;
  };
  users: number[];
  strm: {
    path: string;
    baseURL: string;
  };
}

const file = readFileSync("config.json", "utf-8");

export const config: Config = JSON.parse(file);
