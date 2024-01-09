import { prisma } from "./utils";

export const getTaskById = async (id: number) => {
  return await prisma.task.findUnique({
    where: {
      id,
    },
  });
};

export const getTaskByUrl = async (url: string) => {
  return await prisma.task.findFirst({
    where: {
      url,
    },
  });
};

export const createTask = async (data: {
  requestUser: string;
  requestUserId?: number;
  status: string;
  message: string;
  url: string;
  name?: string;
  savePath?: string;
  hash?: string;
  tmdbId?: number;
  tmdbDetails?: string;
  tmdbSeasonDetails?: string;
  tmdbEpisodeDetails?: string;
}) => {
  return await prisma.task.create({
    data,
  });
};

export const updateTaskById = async (
  id: number,
  data: {
    status?: string;
    message?: string;
    url?: string;
    name?: string;
    savePath?: string;
    hash?: string;
    tmdbId?: number;
  }
) => {
  return await prisma.task.update({
    where: {
      id,
    },
    data,
  });
};
