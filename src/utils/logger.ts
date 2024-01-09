import { createConsola } from "consola";

export const consola = createConsola({
  level: 5,
  formatOptions: {
    colors: true,
    compact: true,
    date: true,
  },
});

consola.wrapAll();
