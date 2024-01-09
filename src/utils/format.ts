import humanFormat from "human-format";

export const format = {
  size: (size: number) => {
    return humanFormat(size, {
      scale: "binary",
      unit: "B",
    });
  },
};

export default format;
