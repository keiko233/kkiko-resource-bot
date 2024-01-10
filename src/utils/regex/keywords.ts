import { toNumber } from "chinese-number-format";

export namespace Keywords {
  export interface Lists {
    [name: string]: {
      keys: string[];
      type: (name: string) => RegexResult;
    };
  }

  export interface RegexResult {
    regexName: string;
    season: number;
    episode: number;
  }
}

const sakurato = (name: string): Keywords.RegexResult => {
  const getName = () => {
    const nameMatch = name.match(/\]\s(.*?)\s\[/);

    if (nameMatch && nameMatch[1]) {
      return nameMatch[1];
    } else {
      return "";
    }
  };

  const getSeason = () => {
    const seasonMatch = name.match(/Season\s+(\d+)|(\d+)rd|(\d+)nd/i);

    if (seasonMatch) {
      let season = seasonMatch[1] || seasonMatch[2] || seasonMatch[3];

      if (season) {
        return Number(season);
      }
    }

    return 1;
  };

  const getEpisode = () => {
    const episodeMatch = name.match(/\[(\d+)\]/);

    if (episodeMatch) {
      return parseInt(episodeMatch[1]);
    } else {
      return 1;
    }
  };

  return {
    regexName: getName(),
    season: getSeason(),
    episode: getEpisode(),
  };
};

const gjy = (name: string): Keywords.RegexResult => {
  const split = name.split(" ");

  const getName = () => {
    const matchd = name.match(/\[.*?\]\s(.*?)\s-\s\d+/);

    return matchd[1] || "";
  };

  const getSeason = () => {
    return toNumber(split[2].replace(/第/g, "").replace(/季/g, "")) || 1;
  };

  const getEpisode = () => {
    let result = 1;

    split.forEach((item) => {
      // @ts-ignore
      if (Number(item) == item) {
        result = Number(item);
      }
    });

    return result;
  };

  return {
    regexName: getName(),
    season: getSeason(),
    episode: getEpisode(),
  };
};

const lolihouse = (name: string) => {
  const seasonRegex = /Season\s+(\d+)|(\d+)rd|(\d+)nd|S(\d+)/i;

  const getName = () => {
    const matchd = name.match(/\[.*?\]\s(.*?)\s-\s\d+/);

    return matchd[1] || "";
  };

  const getEpisode = () => {
    const result = name.match(/-\s+(\d+)/);

    if (result && result[1]) {
      return Number(result[1]);
    } else {
      return 1;
    }
  };

  const getSeason = () => {
    const seasonMatch = name.match(seasonRegex);

    if (seasonMatch) {
      let season =
        seasonMatch[1] || seasonMatch[2] || seasonMatch[3] || seasonMatch[4];

      if (season) {
        return Number(season);
      }
    }

    return 1;
  };

  return {
    regexName: getName(),
    season: getSeason(),
    episode: getEpisode(),
  };
};

const ani = (name: string) => {
  const getName = () => {
    const nameMatch = name.match(/\[.*?\]\s(.*?)\s\[.*?\]\s-\s\d+/);

    if (nameMatch && nameMatch[1]) {
      return nameMatch[1]
    } else {
      return "";
    }
  };

  const getEpisode = () => {
    const result = name.match(/-\s+(\d+)/);

    if (result && result[1]) {
      return Number(result[1]);
    } else {
      return 1;
    }
  };

  const getSeason = () => {
    const seasonMatch = name.match(/Season\s+(\d+)|(\d+)rd|(\d+)nd/i);

    if (seasonMatch) {
      let season = seasonMatch[1] || seasonMatch[2] || seasonMatch[3];

      if (season) {
        return Number(season);
      }
    }

    return 1;
  };

  return {
    regexName: getName(),
    season: getSeason(),
    episode: getEpisode(),
  };
};

export const keywords: Keywords.Lists = {
  sakurato: {
    keys: ["[Sakurato]", "Sakurato"],
    type: sakurato,
  },
  gjy: {
    keys: ["[GJ.Y]"],
    type: gjy,
  },
  lolihouse: {
    keys: ["LoliHouse"],
    type: lolihouse,
  },
  ani: {
    keys: ["ANi"],
    type: ani,
  },
};
