import { config } from "../config";
import { File } from "./file";

export const createOnedrive = () => {
  const token = config.onedrive.token;

  if (!token) {
    throw new Error("onedrive token is required");
  }

  return {
    file: new File(token),
  };
};

export const onedrive = createOnedrive();
