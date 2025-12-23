export const pageFade = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.18 } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.14 } },
};

export const tapScale = {
  whileTap: { scale: 0.98, transition: { duration: 0.09 } },
};

export const listStagger = {
  variants: {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.03,
      },
    },
  },
};
