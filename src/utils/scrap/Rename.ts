import {
  TVAppendToResponse,
  TVGetDetailsResponse,
  TVSeasonsAppendToResponse,
  TVSeasonsGetDetailsEpisode,
  TVSeasonsGetDetailsResponse,
} from "tmdb-js-node";
import {
  config,
  consola,
  formatNumber,
  getFileExtension,
  alist as alistApi,
  keyworkCheck,
} from "..";
import { generateTvName, getVideoFiles } from "./utils";
import { onedrive } from "../onedrive";

const LOGTAG = "[regex/Rename]";

const log = (msg: string, ...args: any) => {
  consola.info(`${LOGTAG} ${msg}`, ...args);
};

export class Rename {
  public tmdbDetails: TVGetDetailsResponse<TVAppendToResponse[]>;
  public tmdbSeasonDetails: TVSeasonsGetDetailsResponse<
    TVSeasonsAppendToResponse[]
  >;
  public tmdbEpisodeDetails?: TVSeasonsGetDetailsEpisode;
  public tvName: string;
  public savePath: string;
  public filePath: string;

  constructor(task: {
    id: number;
    requestUser: string;
    requestUserId: bigint;
    status: string;
    message: string;
    url: string;
    name: string;
    savePath: string;
    hash: string;
    tmdbId: bigint;
    tmdbDetails: string;
    tmdbSeasonDetails: string;
    tmdbEpisodeDetails: string;
  }) {
    this.filePath = task.savePath.substring(1);

    this.tmdbDetails = JSON.parse(task.tmdbDetails);
    this.tmdbSeasonDetails = JSON.parse(task.tmdbSeasonDetails);
    this.tmdbEpisodeDetails = JSON.parse(task.tmdbEpisodeDetails);

    const date = new Date(this.tmdbDetails.first_air_date);

    this.tvName = `${this.tmdbDetails.name} (${date.getFullYear()})`;

    const folderPath = task.savePath.split("/");

    folderPath.pop();

    this.savePath = `${this.tvName}/Season ${this.tmdbEpisodeDetails.season_number}`;
  }

  private async upload() {
    const videoLists = getVideoFiles(this.filePath);

    const alist = await alistApi;

    const season = formatNumber(this.tmdbSeasonDetails.season_number);

    const taskLists = [];

    for (const list of videoLists) {
      const { episode } = keyworkCheck(list.split("/").at(-1));

      const getTmdbEpisodeName = () => {
        let result: TVSeasonsGetDetailsEpisode;

        this.tmdbSeasonDetails.episodes.forEach((item) => {
          if (item.episode_number == episode) {
            result = item;
          }
        });

        return result.name;
      };

      const name = generateTvName(
        this.tmdbDetails.name,
        season,
        formatNumber(episode),
        getTmdbEpisodeName(),
        getFileExtension(list)
      );

      log("Uploading: " + name);

      if (config.uploadDrive == "alist") {
        taskLists.push(
          alist.fs.upload(
            list,
            `${config.alist.rootPath}/${this.savePath}/${name}`,
            true
          )
        );
      } else {
        taskLists.push(
          onedrive.file.upload(
            list,
            `${config.onedrive.rootPath}/${this.savePath}/${name}`
          )
        );
      }

      if (!config.concurrentUpload) {
        await taskLists[taskLists.length - 1];

        log("Upload: ", name);
      }
    }

    log("Upload Promise: ", await Promise.all(taskLists));
  }

  public async run() {
    log("Toggle Rename & Upload: " + this.tvName);

    await this.upload();
  }
}
