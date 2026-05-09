const express = require("express");
const path = require("path");
const cors = require("cors");
const { PORT } = require("./constants");

const app = express();
async function bootstrap() {
  app.use(cors());
  app.use(express.json());
  app.use("/static", express.static(path.join(__dirname, "..", "public")));
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

bootstrap();
