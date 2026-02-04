module.exports = {
  reporter: [["html", { open: "never" }]],
  use: {
    baseURL: process.env.BASE_URL || "http://127.0.0.1",
  },
};
