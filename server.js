// Library Imports
const express = require("express");
require("dotenv").config();
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
// Route Imports
const chainRouter = require("./src/routes/chain.routes");
const helpersRouter = require("./src/routes/helpers.routes");
const liquidityLockRouter = require("./src/routes/liquidityLocks.routes");
const tokenLockRouter = require("./src/routes/tokenLocks.routes");
const vestingLockRouter = require("./src/routes/vestingLocks.routes");
const nftRouter = require("./src/routes/nft.routes");

// Global variables
const { PORT, MONGODB_USERNAME, MONGODB_PASSWORD, MONGODB_SERVER, MLAB_DATABASE } = process.env;

const mongoose = require("mongoose");
mongoose.connect(`mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_SERVER}/${MLAB_DATABASE}`);

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 500, // Limit each IP to 60 requests per `window` (here, per 1 minutes)
  message: "Rate limit reached",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const app = express();

app.use(limiter);

app.use(helmet());

app.use(cors({ origin: "*", credentials: true }));

app.disable("x-powered-by");

// Listener Imports
const nftPayout = require("./src/utils/events/nativeTokenEvents");
const tokenLockEvents = require("./src/utils/events/tokenLockEvents");
const vestingLockEvents = require("./src/utils/events/vestingLockEvents");
const liquidityLockEvents = require("./src/utils/events/liquidityLockEvents");
const { startGasPrice, startChainPrice } = require("./src/utils/priceHelpers");

// Initialize web3 listeners
tokenLockEvents();
vestingLockEvents();
liquidityLockEvents();
nftPayout();
startChainPrice();
startGasPrice();

app.use("/", chainRouter);
app.use("/", helpersRouter);
app.use("/", liquidityLockRouter);
app.use("/", tokenLockRouter);
app.use("/", vestingLockRouter);
app.use("/", nftRouter);

// Server
app.listen(PORT, () => {
  console.log("Listening on port " + PORT);
});
