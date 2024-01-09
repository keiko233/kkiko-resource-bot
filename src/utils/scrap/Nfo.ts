import { getTaskById } from "@/model";
import {
  TVGetDetailsResponse,
  TVAppendToResponse,
  TVSeasonsGetDetailsResponse,
  TVSeasonsAppendToResponse,
  TVSeasonsGetDetailsEpisode,
  TVGetAggregateCreditsResponse,
  TVGetKeywordsResponse,
  TVGetImagesResponse,
  TVGetContentRatingsResponse,
} from "tmdb-js-node";
import countries from "i18n-iso-countries";
import tmdb from "../tmdb";
import { writeFileSync } from "fs";
import { js2xml, Element } from "xml-js";
import { downloadFileToBuffer } from "../buffer";
import { formatNumber } from "../text";
import { consola } from "../logger";

const LOGTAG = "[scrap/Nfo]";

const log = (msg: string, ...args: any) => {
  consola.info(`${LOGTAG} ${msg}`, ...args);
};

export class Nfo {
  public tmdbDetails: TVGetDetailsResponse<TVAppendToResponse[]>;
  public tmdbSeasonDetails: TVSeasonsGetDetailsResponse<
    TVSeasonsAppendToResponse[]
  >;
  public tmdbEpisodeDetails: TVSeasonsGetDetailsEpisode;
  public aggregateCredits: TVGetAggregateCreditsResponse;
  public keywords: TVGetKeywordsResponse;
  public images: TVGetImagesResponse;
  public contentRatings: TVGetContentRatingsResponse;
  public data: {
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
    createdAt: Date;
    updatedAt: Date;
  };

  private generateActor() {
    return this.aggregateCredits.cast.map((item) => {
      return {
        name: {
          _text: item.name,
        },
        role: {
          _text: item.roles[0].character,
        },
        thumb: {
          _text: this.generateImageUrl(item.profile_path),
        },
        profile: {
          _text: `https://www.themoviedb.org/person/${item.id}`,
        },
        tmdbid: {
          _text: item.id,
        },
      };
    });
  }

  private generateGenre() {
    return this.tmdbDetails.genres.map((genre) => {
      return {
        _text: genre.name,
      };
    });
  }

  private generateStudio() {
    return this.tmdbDetails.production_companies.map((companie) => {
      return {
        _text: companie.name,
      };
    });
  }

  private generateTag() {
    return this.keywords.results.map((item) => {
      return item.name;
    });
  }

  private generateThumb() {
    const result: any[] = [
      {
        _attributes: {
          aspect: "poster",
        },
        _text: this.generateImageUrl(this.images.posters[0].file_path),
      },
      {
        _attributes: {
          aspect: "logo",
        },
        // @ts-ignore
        _text: this.generateImageUrl(this.images.logos[0].file_path),
      },
    ];

    this.tmdbDetails.seasons.forEach((item) => {
      result.push({
        _attributes: {
          aspect: "poster",
          season: item.season_number,
          type: "season",
        },
        _text: this.generateImageUrl(item.poster_path),
      });
    });

    return result;
  }

  private generateNamedseason() {
    return this.tmdbDetails.seasons.map((item) => {
      return {
        _attributes: {
          number: item.season_number,
        },
        _text: item.name,
      };
    });
  }

  private generateMpaa() {
    return this.contentRatings.results[0].rating;
  }

  private generateImageUrl(path: string) {
    return `https://image.tmdb.org/t/p/original${path}`;
  }

  public async getInfo(id: number) {
    log("query database: " + id);
    this.data = await getTaskById(id);

    this.tmdbDetails = JSON.parse(this.data.tmdbDetails);

    this.tmdbSeasonDetails = JSON.parse(this.data.tmdbSeasonDetails);

    this.tmdbEpisodeDetails = JSON.parse(this.data.tmdbEpisodeDetails);

    const tmdbId = Number(this.data.tmdbId);

    log("query AggregateCredits: " + tmdbId);
    this.aggregateCredits = await tmdb.v3.tv.getAggregateCredits(tmdbId);

    log("query keywords: " + tmdbId);
    this.keywords = await tmdb.v3.tv.getKeywords(tmdbId);

    log("query images: " + tmdbId);
    this.images = await tmdb.v3.tv.getImages(tmdbId, {
      // @ts-ignore
      include_image_language: "ja",
    });

    log("query contentRatings: " + tmdbId);
    this.contentRatings = await tmdb.v3.tv.getContentRatings(tmdbId);
  }

  public generateTvshow(path: string) {
    const info = {
      _declaration: {
        _attributes: {
          version: "1.0",
          encoding: "utf-8",
          standalone: "yes",
        },
      },
      tvshow: {
        title: {
          _text: this.tmdbDetails.name,
        },
        originaltitle: {
          _text: this.tmdbDetails.original_name,
        },
        showtitle: {
          _text: this.tmdbDetails.name,
        },
        sorttitle: {},
        year: {
          _text: new Date(this.tmdbDetails.first_air_date).getFullYear(),
        },
        ratings: {
          rating: {
            _attributes: {
              default: "true",
              max: "10",
              name: "themoviedb",
            },
            value: {
              _text: this.tmdbDetails.vote_average,
            },
            votes: {
              _text: this.tmdbDetails.vote_count,
            },
          },
        },
        userrating: {
          _text: "0.0",
        },
        outline: {},
        plot: {
          _text: this.tmdbDetails.overview,
        },
        tagline: {},
        runtime: {
          _text: this.tmdbDetails.episode_run_time[0],
        },
        lockdata: {
          _text: "false",
        },
        dateadded: {
          _text: this.tmdbDetails.first_air_date,
        },
        actor: this.generateActor(),
        rating: {
          _text: 8.4,
        },
        tmdbid: {
          _text: this.data.tmdbId,
        },
        premiered: {
          _text: this.tmdbDetails.first_air_date,
        },
        releasedate: {
          _text: this.tmdbDetails.first_air_date,
        },

        country: {
          _text: countries.getName(this.tmdbDetails.origin_country[0], "zh"),
        },
        genre: this.generateGenre(),
        studio: this.generateStudio(),
        tag: this.generateTag(),
        uniqueid: [
          {
            _attributes: {
              type: "tmdb",
            },
            _text: Number(this.data.tmdbId),
          },
        ],
        episodeguide: {
          _text: JSON.stringify({
            tmdb: Number(this.data.tmdbId),
          }),
        },
        id: {
          _text: this.data.tmdbId,
        },
        season: {
          _text: -1,
        },
        episode: {
          _text: -1,
        },
        displayorder: {
          _text: "aired",
        },
        status: {
          _text: this.tmdbDetails.status,
        },
        thumb: this.generateThumb(),
        namedseason: this.generateNamedseason(),
        fanart: {
          thumb: {
            _text: this.generateImageUrl(this.tmdbDetails.backdrop_path),
          },
        },
        mpaa: {
          _text: this.generateMpaa(),
        },
      },
    };

    writeFileSync(
      `${path}/tvshow.nfo`,
      js2xml(info as Element, {
        compact: true,
        spaces: 4,
      })
    );
  }

  private async writeFile(url: string, path: string, name: string) {
    function getFileExtension(filename: string) {
      return filename.split(".").pop();
    }

    const filepath = `${path}/${name}.${getFileExtension(url)}`;

    log("writeFile: " + filepath);

    // return new Promise(async (resolve, reject) => {
    //   writeFile(
    //     filepath,
    //     await downloadFileToBuffer(this.generateImageUrl(url)),
    //     function (err) {
    //       if (err) {
    //         reject(err);
    //       } else {
    //         resolve("success");
    //       }
    //     }
    //   );
    // });

    return writeFileSync(
      filepath,
      await downloadFileToBuffer(this.generateImageUrl(url))
    );
  }

  public saveTvImages(path: string) {
    const tasks = [];

    tasks.push(
      this.writeFile(this.images.posters[0].file_path, path, "poster")
    );

    tasks.push(
      this.writeFile(this.images.posters[0].file_path, path, "folder")
    );

    // @ts-ignore
    tasks.push(this.writeFile(this.images.logos[0].file_path, path, "logo"));

    tasks.push(this.writeFile(this.tmdbDetails.backdrop_path, path, "fanart"));

    this.tmdbDetails.seasons.forEach((item) => {
      tasks.push(
        this.writeFile(
          item.poster_path,
          path,
          `season${formatNumber(item.season_number)}-poster`
        )
      );
    });

    return tasks;
  }

  public generateTvshowSeason(path: string) {
    const info = {
      _declaration: {
        _attributes: {
          version: "1.0",
          encoding: "utf-8",
          standalone: "yes",
        },
      },
      season: {
        outline: {},
        plot: {
          _text: this.tmdbSeasonDetails.overview,
        },
        lockdata: {
          _text: false,
        },
        dateadded: {
          _text: this.tmdbSeasonDetails.air_date,
        },
        title: {
          _text: this.tmdbSeasonDetails.name,
        },
        year: {
          _text: new Date(this.tmdbSeasonDetails.air_date).getFullYear(),
        },
        sorttitle: {
          _text: this.tmdbSeasonDetails.name,
        },
        tmdbid: {
          _text: this.tmdbSeasonDetails.id,
        },
        premiered: {
          _text: this.tmdbSeasonDetails.air_date,
        },
        releasedate: {
          _text: this.tmdbSeasonDetails.air_date,
        },
        uniqueid: {
          _attributes: {
            type: "tmdb",
          },
          _text: this.tmdbSeasonDetails.id,
        },
        seasonnumber: {
          _text: this.tmdbSeasonDetails.season_number,
        },
      },
    };

    const filepath = `${path}/Season ${this.tmdbSeasonDetails.season_number}/season.nfo`;

    log("writeFile: " + filepath);

    writeFileSync(
      filepath,
      js2xml(info as Element, {
        compact: true,
        spaces: 4,
      })
    );
  }

  public saveTvSeasonImages(path: string, filename: string) {
    path = `${path}/Season ${this.tmdbSeasonDetails.season_number}`;

    const tasks = [];

    tasks.push(
      this.writeFile(this.images.posters[0].file_path, path, "folder")
    );

    this.tmdbDetails.seasons.forEach((item) => {
      if (item.season_number == this.tmdbSeasonDetails.season_number) {
        tasks.push(
          this.writeFile(
            item.poster_path,
            path,
            `season${formatNumber(item.season_number)}`
          )
        );
      }
    });

    this.tmdbSeasonDetails.episodes.forEach((item) => {
      if (item.episode_number == this.tmdbEpisodeDetails.episode_number) {
        tasks.push(
          this.writeFile(item.still_path, path, filename.split(".")[0])
        );
      }
    });

    return tasks;
  }
}
