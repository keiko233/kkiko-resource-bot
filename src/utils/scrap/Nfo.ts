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
import { formatNumber, getFileExtension } from "../text";
import { consola } from "../logger";
import { createFolderRecursive } from "../file";
import { generateTvName, getVideoFiles } from "./utils";
import { keyworkCheck } from "../regex";
import { makeStrm } from "./Strm";

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
  };
  public generatePath: string;
  public videoLists: string[];
  public tvName: string;

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
    const results = this.contentRatings.results;

    if (results.length > 0) {
      return results[0].rating;
    } else {
      return "none";
    }
  }

  private generateImageUrl(path: string) {
    return `https://image.tmdb.org/t/p/original${path}`;
  }

  public async getInfo() {
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

  public generateTvshow() {
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
      `${this.generatePath}/tvshow.nfo`,
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

    return writeFileSync(
      filepath,
      await downloadFileToBuffer(this.generateImageUrl(url))
    );
  }

  public saveTvImages() {
    const tasks = [];

    tasks.push(
      this.writeFile(
        this.images.posters[0].file_path,
        this.generatePath,
        "poster"
      )
    );

    tasks.push(
      this.writeFile(
        this.images.posters[0].file_path,
        this.generatePath,
        "folder"
      )
    );

    tasks.push(
      // @ts-ignore
      this.writeFile(this.images.logos[0].file_path, this.generatePath, "logo")
    );

    tasks.push(
      this.writeFile(
        this.tmdbDetails.backdrop_path,
        this.generatePath,
        "fanart"
      )
    );

    this.tmdbDetails.seasons.forEach((item) => {
      tasks.push(
        this.writeFile(
          item.poster_path,
          this.generatePath,
          `season${formatNumber(item.season_number)}-poster`
        )
      );
    });

    return tasks;
  }

  public generateTvshowSeason() {
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

    const filepath = `${this.generatePath}/Season ${this.tmdbSeasonDetails.season_number}`;

    createFolderRecursive(filepath);

    log("writeFile: " + filepath);

    writeFileSync(
      `${filepath}/season.nfo`,
      js2xml(info as Element, {
        compact: true,
        spaces: 4,
      })
    );
  }

  public saveTvSeasonInfo() {
    const path = `${this.generatePath}/Season ${this.tmdbSeasonDetails.season_number}`;

    const tasks = [];

    const generateTask = (filename: string) => {
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
    };

    this.videoLists = getVideoFiles(this.data.savePath.substring(1));

    this.videoLists.forEach((item) => {
      const originName = item.split("/").at(-1);

      const { episode } = keyworkCheck(originName);

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
        formatNumber(this.tmdbSeasonDetails.season_number),
        formatNumber(episode),
        getTmdbEpisodeName(),
        getFileExtension(item)
      );

      makeStrm(
        `${this.tvName}/Season ${this.tmdbSeasonDetails.season_number}/${name}`
      );

      generateTask(name);
    });

    return tasks;
  }

  public async run(
    task: {
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
    },
    tvName: string
  ) {
    this.tvName = tvName;

    this.data = task;

    this.generatePath = `tmp/task-${this.data.id}/${tvName}`;

    log(this.generatePath);

    await this.getInfo();

    createFolderRecursive(this.generatePath);

    this.generateTvshow();

    await Promise.all(this.saveTvImages());

    this.generateTvshowSeason();

    await Promise.all(this.saveTvSeasonInfo());
  }
}
