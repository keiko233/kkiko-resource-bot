import { config } from "../config";
import { consola } from "../logger";
import { Auth } from "./auth";
import { Fs } from "./fs";

export const createAlist = async () => {
  try {
    const auth = new Auth();

    const token = (
      await auth.login(config.alist.username, config.alist.password)
    ).data.token;

    consola.success("Successfully login to alist");

    return {
      fs: new Fs(token),
    };
  } catch (err) {
    consola.error("Failed to login alist");

    throw new Error(err);
  }
};

export const alist = createAlist();
