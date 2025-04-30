// server.js
const express = require("express");
const http = require("http");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const { initializeCollections } = require("./database/mongoCollections");
const { initializeFirebase } = require("./app/middlewares/firebaseAdmin");
const { errorLogger } = require("./app/middlewares/errorLogger");
const {
  scheduleDailyEmail,
  scheduleSoftDeleteUsersCheck,
} = require("./app/middlewares/nodeCron");

// Initialize Express app
const app = express();

// Set CORS origins
let allowedOrigins = null;

if (process.env.ENV === "production") {
  allowedOrigins = process.env.PROD_CLIENT_URLS.split(",");
} else if (process.env.ENV === "development") {
  allowedOrigins = [
    process.env.DEV_CLIENT_URL,
    ...process.env.PROD_CLIENT_URLS.split(","),
  ];
}

const server = http.createServer(app);

// Initialize middleware

// Important: Place the webhook route before any body parsers
app.use("/webhook", require("./app/routes/stripeWebhookRoute"));

// Body parsers for all other routes
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

// Update the main CORS middleware
app.use(
  cors({
    origin: allowedOrigins,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
    optionsSuccessStatus: 204,
    exposedHeaders: ["Content-Length", "Content-Type"],
  })
);

// Configure multer for file uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Add before your routes
// app.use((req, res, next) => {
//   res.setHeader(
//     "Content-Security-Policy",
//     "default-src 'self'; font-src 'self' https://js.stripe.com data:; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline';"
//   );
//   next();
// });

// Instead of chaining promises, use async/await and initialize everything before setting up routes
const startServer = async () => {
  try {
    await initializeCollections();
    await initializeFirebase();
    console.log("Server Ready");

    // Log all requests
    app.use((req, res, next) => {
      console.log(`${req.method} ${req.url}`);
      next();
    });

    // Move all route definitions here, after initialization is complete
    app.get("/", (req, res) => {
      res.json({ message: "Hello World!" });
    });

    // Import routes
    app.use("/api/users", require("./app/routes/usersRoutes"));
    app.use("/api/campaigns", require("./app/routes/campaignsRoutes"));
    app.use("/api/timelines", require("./app/routes/timelinesRoutes"));
    app.use("/api/characters", require("./app/routes/charactersRoutes"));
    app.use("/api/families", require("./app/routes/familiesRoutes"));
    app.use("/api/events", require("./app/routes/eventsRoutes"));
    app.use("/api/stripe", require("./app/routes/stripeRoutes"));
    app.use("/api/jira", require("./app/routes/jiraRoutes"));
    app.use("/api/server-utils", require("./app/routes/serverUtilsRoutes"));
    app.use("/api/agreements", require("./app/routes/agreementsRoutes"));
    app.use("/api/firebase", require("./app/routes/firebaseRoutes"));
    app.use("/api/logs", require("./app/routes/logsRoutes"));

    app.use(errorLogger);

    if (process.env.ENV === "production") {
      // Cron Jobs
      scheduleDailyEmail();
      scheduleSoftDeleteUsersCheck();
    }

    // Start server
    const PORT = process.env.DEV_SERVER_URL_PORT;
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
