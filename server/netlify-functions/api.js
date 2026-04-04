const serverless = require("serverless-http");

let cachedHandler;

exports.handler = async (event, context) => {
  if (!cachedHandler) {
    const { createApp } = await import("../src/app.js");
    cachedHandler = serverless(createApp());
  }

  return cachedHandler(event, context);
};
