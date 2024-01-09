import { consola } from "@/utils";
import { PrismaClient } from "@prisma/client";

export const usePrisma = () => {
  try {
    const client = new PrismaClient();

    consola.success("PrismaClient Connected");

    return client;
  } catch (e) {
    consola.error("PrismaClient could not be connected");

    throw new Error(e);
  }
};

export const prisma = usePrisma();
