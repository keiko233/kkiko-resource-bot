import { QBittorrent } from "@ctrl/qbittorrent";
import { config } from "@/utils/config";
import consola from "consola";

export const useClient = () => {
  try {
    const api = new QBittorrent(config.qbitorrent);

    consola.success("QBittorrent Connected");

    return api;
  } catch (e) {
    consola.error("QBittorrent could not be connected");

    throw new Error(e);
  }
};

export const client = useClient();

export default client;
