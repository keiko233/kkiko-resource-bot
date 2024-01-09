import { downloadFileToBuffer } from "../buffer";

export const getImageBuffer = async (path: string) => {
  const baseUrl = "https://image.tmdb.org/t/p/original";

  return await downloadFileToBuffer(baseUrl + path);
};
