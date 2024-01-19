import { prisma } from "./utils";

export const getRssById = async (id: number) => {
  return await prisma.rss.findUnique({
    where: {
      id,
    },
  });
};

export const getAllRss = async () => {
  return await prisma.rss.findMany();
};

export const createRss = async (data: {
  requestUser: string;
  requestUserId?: number;
  name: string;
  url: string;
  regex: string;
  latestAt?: Date;
}) => {
  return await prisma.rss.create({
    data,
  });
};

export const updateRssbyId = async (
  id: number,
  data: {
    requestUser?: string;
    requestUserId?: number;
    name?: string;
    url?: string;
    regex?: string;
    subUserIds?: string;
    latestAt?: Date;
  }
) => {
  return await prisma.rss.update({
    where: {
      id,
    },
    data,
  });
};

export const getRssByRequestUserId = async (requestUserId: number) => {
  return await prisma.rss.findMany({
    where: {
      requestUserId,
    },
  });
};

export const getRssBySubUserId = async (subUserId: number) => {
  return await prisma.rss.findMany({
    where: {
      subUserIds: {
        contains: String(subUserId),
      },
    },
  });
};

export const deleteRssById = async (id: number) => {
  return await prisma.rss.delete({
    where: {
      id,
    },
  });
};
