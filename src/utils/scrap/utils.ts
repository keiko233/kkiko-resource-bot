import { traverseDirectory } from "../file";
import { array2text } from "../text";

export const generateTvName = (
  tvName: string,
  season: string | number,
  episode: string | number,
  episodeName: string,
  fileExtension: string
) => {
  return array2text(
    [
      tvName,
      "-",
      `S${season}E${episode}`,
      "-",
      `${episodeName}.${fileExtension}`,
    ],
    "space"
  );
};

export const getVideoFiles = (savePath: string) => {
  const result = traverseDirectory(savePath);

  const videoLists: string[] = [];

  result.forEach((item) => {
    if (/\.(mkv|mp4|mov)$/.test(item)) {
      if (!/(SPs|Menu)/i.test(item)) {
        videoLists.push(item);
      }
    }
  });

  return videoLists;
};
