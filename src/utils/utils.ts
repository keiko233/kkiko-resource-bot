export const delay = (delaytime: number) => {
  return new Promise((resolve) => setTimeout(resolve, delaytime));
};
