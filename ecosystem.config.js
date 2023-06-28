module.exports = {
  apps: [
    {
      name: "KAIWeb",
      exec_mode: "cluster",
      instances: "max",
      script: "./.output/server/index.mjs",
    },
  ],
};
