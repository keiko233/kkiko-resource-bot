import {
  TVAppendToResponse,
  TVGetDetailsResponse,
  TVSeasonsAppendToResponse,
  TVSeasonsGetDetailsEpisode,
  TVSeasonsGetDetailsResponse,
} from "tmdb-js-node";
import { keywords } from "./keywords";
import tmdb from "../tmdb";

export const keyworkCheck = (name: string) => {
  for (let key in keywords) {
    let item = keywords[key];
    if (item.keys.some((k: string) => name.includes(k))) {
      return item.type(name);
    }
  }

  return keywords.sakurato.type(name);
};

export class Extract {
  public regexName: string;
  public season: number;
  public episode: number;
  public tmdbDetails: TVGetDetailsResponse<TVAppendToResponse[]>;
  public tmdbSeasonDetails: TVSeasonsGetDetailsResponse<
    TVSeasonsAppendToResponse[]
  >;
  public tmdbEpisodeDetails: TVSeasonsGetDetailsEpisode;

  public async regex(name: string) {
    await this.regexUniversal(name);

    return {
      regexName: this.regexName,
      season: this.season,
      episode: this.episode,
      tmdbDetails: this.tmdbDetails,
      tmdbSeasonDetails: this.tmdbSeasonDetails,
      tmdbEpisodeDetails: this.tmdbEpisodeDetails,
    };
  }

  private async regexUniversal(name: string) {
    const { regexName, episode, season } = keyworkCheck(name);

    this.regexName = regexName;
    this.season = season;
    this.episode = episode;

    await this.searchFromTMDB();
  }

  private async searchFromTMDB() {
    const result = await tmdb.v3.search.searchMulti({
      query: this.regexName,
      language: "zh-CN",
    });

    if (!result.total_results) {
      throw new Error("tmdb no search result");
    }

    this.tmdbDetails = await tmdb.v3.tv.getDetails(result.results[0].id, {
      language: "zh-CN",
    });

    this.tmdbSeasonDetails = await tmdb.v3.tvSeasons.getDetails(
      this.tmdbDetails.id,
      this.season,
      {
        language: "zh-CN",
      }
    );

    this.tmdbSeasonDetails.episodes.forEach((item) => {
      if (item.episode_number == this.episode) {
        this.tmdbEpisodeDetails = item;
      }
    });
  }
}
