import humanFormat from "human-format";
import dayjs from "dayjs";

export const format = {
  size: (size: number) => {
    return humanFormat(size, {
      scale: "binary",
      unit: "B",
    });
  },
  date: (date: number | Date) => {
    return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
  },
};

export default format;
