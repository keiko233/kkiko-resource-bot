import {
  download,
  help,
  rss,
  myrss,
  subrss,
  query24h,
  renameRss,
  delRss,
} from "./method";

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
  {
    cmd: "subrss",
    func: subrss,
  },
  {
    cmd: "24h",
    func: query24h,
  },
  {
    cmd: "query24h",
    func: query24h,
  },
  {
    cmd: "renamerss",
    func: renameRss,
  },
  {
    cmd: "delrss",
    func: delRss,
  },
];
