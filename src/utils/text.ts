export const array2text = (
  array: string[],
  type: "newline" | "space" = "newline"
): string => {
  let result = "";

  const getSplit = () => {
    if (type == "newline") {
      return "\n";
    } else if (type == "space") {
      return " ";
    }
  };

  array.forEach((value, index) => {
    if (index === array.length - 1) {
      result += value;
    } else {
      result += value + getSplit();
    }
  });

  return result;
};

export const isLink = (str: string): boolean => {
  const linkRegex = /^(http|https):\/\/[^ "]+$/;

  return linkRegex.test(str);
};

export const formatNumber = (num: number): string => {
  return num.toString().padStart(2, "0");
};

export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
};

export const getFileExtensionV2 = (filename: string): string => {
  const parts = filename.split(".");
  let extension = parts.pop() || "";

  if (parts.length > 0) {
    extension =
      parts.length > 1
        ? `.${parts.slice(-1).join(".")}.${extension}`
        : `.${extension}`;
  }

  return extension;
};

export namespace Rss {
  export interface Channel {
    channel: {
      item: Item | Item[];
      title: {
        _text: string;
      };
      description: {
        _text: string;
      };
      link: {
        _text: string;
      };
      ttl: {
        _text: string;
      };
    };
  }

  export interface Item {
    title: {
      _text: string;
    };
    pubDate: {
      _text: string;
    };
    link: {
      _text: string;
    };
    enclosure: {
      _attributes: {
        url: string;
      };
    };
    torrent: {
      _attributes: {
        xmlns: string;
      };
      link: {
        _text: string;
      };
      contentLength: {
        _text: string;
      };
      pubDate: {
        _text: string;
      };
    };
  }

  export interface RegexRss {
    title: string;
    pubDate: string;
    link: string;
    url: string;
  }
}

export const rssRegex = (rss: Rss.Channel): Rss.RegexRss[] => {
  const mikan = /Mikan Project/;
  const acgrip = /ACG.RIP/;

  if (mikan.test(rss.channel.title._text)) {
    const generateRss = (element: Rss.Item) => {
      return {
        title: element.title._text,
        pubDate: element.torrent.pubDate._text,
        link: element.torrent.link._text,
        url: element.enclosure._attributes.url,
      };
    };

    if (rss.channel.item instanceof Array) {
      return rss.channel.item.map((element) => {
        return generateRss(element);
      });
    } else {
      return [generateRss(rss.channel.item)];
    }
  } else {
    const generateRss = (element: Rss.Item) => {
      return {
        title: element.title._text,
        pubDate: element.pubDate._text,
        link: element.link._text,
        url: element.enclosure._attributes.url,
      };
    };

    if (rss.channel.item instanceof Array) {
      return rss.channel.item.map((element) => {
        return generateRss(element);
      });
    } else {
      return [generateRss(rss.channel.item)];
    }
  }
};

export function paginate<T>(
  array: T[],
  pageSize: number,
  pageNumber: number
): T[] {
  return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
}
