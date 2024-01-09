import {
  TVAppendToResponse,
  TVGetDetailsResponse,
  TVSeasonsAppendToResponse,
  TVSeasonsGetDetailsEpisode,
  TVSeasonsGetDetailsResponse,
} from "tmdb-js-node";
import { keywords } from "./keywords";
import { toNumber } from "chinese-number-format";
import tmdb from "../tmdb";

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
    const type = this.keyworkCheck(name);

    await this.regexUniversal(name, type);

    return {
      regexName: this.regexName,
      season: this.season,
      episode: this.episode,
      tmdbDetails: this.tmdbDetails,
      tmdbSeasonDetails: this.tmdbSeasonDetails,
      tmdbEpisodeDetails: this.tmdbEpisodeDetails,
    };
  }

  private keyworkCheck(name: string) {
    for (let key in keywords) {
      let item = keywords[key];
      if (item.keys.some((k: string) => name.includes(k))) {
        return item.type;
      }
    }
  }

  private async regexUniversal(name: string, type: number = 0) {
    switch (type) {
      case 0:
      default: {
        const nameMatch = name.match(/\]\s(.*?)\s\[/);

        if (nameMatch && nameMatch[1]) {
          this.regexName = nameMatch[1];
        }

        const seasonMatch = name.match(/Season\s+(\d+)/i);

        const rdMatch = name.match(/\b\d+rd\b/);

        if (seasonMatch) {
          this.season = Number(seasonMatch[1]);
        } else if (rdMatch) {
          this.season = Number(rdMatch[0].match(/\d+/));
        } else {
          this.season = 1;
        }

        const episodeMatch = name.match(/\[(\d+)\]/);

        if (episodeMatch) {
          this.episode = parseInt(episodeMatch[1]);
        }

        break;
      }

      case 1: {
        const split = name.split(" ");

        this.regexName = split[1];
        this.season = toNumber(split[2].replace(/第/g, "").replace(/季/g, ""));

        split.forEach((item) => {
          // @ts-ignore
          if (Number(item) == item) {
            this.episode = Number(item);
          }
        });

        break;
      }
    }

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
