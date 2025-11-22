module.exports = {
  apps: [
    {
      name: "moodbuddy-backend",
      script: "./server.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "development",
        PORT: 5001,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 5001,
      },
    },
  ],
};
