import { ofetch } from "ofetch";
import { config } from "../config";

export const generateOptions = (token?: string) => {
  return {
    baseURL: `${config.alist.baseURL}api`,
    headers: {
      Authorization: token,
    },
  };
};

export const useRequest = (token?: string) => {
  return ofetch.create(generateOptions(token));
};

export interface Response<T> {
  code: number;
  message: string;
  data: T;
}

export const generateBoundary = () => {
  return "----WebKitFormBoundary" + Math.random().toString(36).substring(2);
};
