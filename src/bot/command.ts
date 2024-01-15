import { download, help, rss, myrss } from "./method";

export const cmdMap = [
  {
    cmd: "start",
    func: help,
  },
  {
    cmd: "help",
    func: help,
  },
  {
    cmd: "download",
    func: download,
  },
  {
    cmd: "rss",
    func: rss,
  },
  {
    cmd: "myrss",
    func: myrss,
  },
];
