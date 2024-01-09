import {
  TVAppendToResponse,
  TVGetDetailsResponse,
  TVSeasonsAppendToResponse,
  TVSeasonsGetDetailsEpisode,
  TVSeasonsGetDetailsResponse,
} from "tmdb-js-node";
import {
  array2text,
  consola,
  createFolderRecursive,
  formatNumber,
  getFileExtension,
} from "..";
import { renameSync } from "fs";

const LOGTAG = "[regex/Rename]";

const log = (msg: string, ...args: any) => {
  consola.info(`${LOGTAG} ${msg}`, ...args);
};

export class Rename {
  public tmdbDetails: TVGetDetailsResponse<TVAppendToResponse[]>;
  public tmdbSeasonDetails: TVSeasonsGetDetailsResponse<
    TVSeasonsAppendToResponse[]
  >;
  public tmdbEpisodeDetails: TVSeasonsGetDetailsEpisode;
  public tvName: string;
  public savePath: string;
  public filePath: string;

  constructor(
    filePath: string,
    tmdbDetails: TVGetDetailsResponse<TVAppendToResponse[]>,
    tmdbSeasonDetails: TVSeasonsGetDetailsResponse<TVSeasonsAppendToResponse[]>,
    tmdbEpisodeDetails: TVSeasonsGetDetailsEpisode
  ) {
    this.filePath = filePath.substring(1);

    this.tmdbDetails = tmdbDetails;
    this.tmdbSeasonDetails = tmdbSeasonDetails;
    this.tmdbEpisodeDetails = tmdbEpisodeDetails;

    const date = new Date(tmdbDetails.first_air_date);

    this.tvName = `${tmdbDetails.name} (${date.getFullYear()})`;

    const folderPath = filePath.split("/");

    folderPath.pop();

    this.savePath = `${folderPath.join("/")}/${this.tvName}/Season ${
      this.tmdbEpisodeDetails.season_number
    }`.substring(1);
  }

  public async getFileName() {
    const season = formatNumber(this.tmdbEpisodeDetails.season_number);

    const episode = formatNumber(this.tmdbEpisodeDetails.episode_number);

    const name = [
      this.tmdbDetails.name,
      "-",
      `S${season}E${episode}`,
      "-",
      `${this.tmdbEpisodeDetails.name}.${getFileExtension(this.filePath)}`,
    ];

    return array2text(name, "space");
  }

  private async rename() {
    const fileName = await this.getFileName();

    const path = `${this.savePath}/${fileName}`;

    renameSync(this.filePath, path);

    log(`Move ${this.filePath} Rename to ${path}`);
  }

  public async run() {
    log("Toggle Rrename: " + this.tvName);

    createFolderRecursive(this.savePath);

    await this.rename();
  }
}
