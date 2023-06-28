import type { RouterOptions } from "@nuxt/schema";

export default <RouterOptions>{
  scrollBehavior(to, from, savedPosition) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (to.hash) {
          resolve({
            el: to.hash,
            top: 170,
            behavior: "smooth",
          });
        } else {
          resolve({
            left: savedPosition?.left || 0,
            top: savedPosition?.top || 0,
          });
        }
      }, 500);
    });
  },
};
