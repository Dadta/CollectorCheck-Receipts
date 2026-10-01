const express = require("express");
const path = require("path");
const app = express();
app.use(express.json());

const routes = require("./routes");
const orchestrator = require("../orchestrator");

orchestrator.init(); // boots all modules

app.use("/", express.static(path.join(__dirname, "../../client/dashboard")));
app.use("/clients", express.static(path.join(__dirname, "../../client")));
app.use("/", routes);

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Continuity Engine running on port ${PORT}`);
});
