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

export const rssRegex = (rss: {
  channel: {
    item: {
      title: { _text: string };
      pubDate: { _text: string };
      link: { _text: string };
      enclosure: { _attributes: { url: string } };
    }[];
  };
}): {
  title: string;
  pubDate: string;
  link: string;
  url: string;
}[] => {
  return rss.channel.item.map((element) => {
    return {
      title: element.title._text,
      pubDate: element.pubDate._text,
      link: element.link._text,
      url: element.enclosure._attributes.url,
    };
  });
};
