module.exports = {
  apps: [
    {
      name: "backend",
      script: "./server.js",
      cwd: "/home/santy/Batallon11/server",

      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
