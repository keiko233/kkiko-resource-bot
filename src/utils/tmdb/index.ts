import { TMDBNodeApi } from "tmdb-js-node";
import { config } from "@/utils/config";
import consola from "consola";

export const createTMDB = () => {
  try {
    const tmdb = new TMDBNodeApi(config.tmdb.api_key, config.tmdb.access_token);

    consola.success("Successfully Connected to TMDB");

    return tmdb;
  } catch (err) {
    consola.error("Failed to connect to TMDB");

    throw new Error(err);
  }
};

export const tmdb = createTMDB();

export default tmdb;
