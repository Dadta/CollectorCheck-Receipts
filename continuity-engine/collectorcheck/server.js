const express = require("express");
const verifyRouter = require("./routes/verify");

const app = express();

app.use(express.json());
app.get("/health", (req, res) => res.json({ status: "ok", service: "CollectorCheck" }));
app.use("/verify", verifyRouter);

if (require.main === module) {
    const port = Number(process.env.PORT) || 4001;
    app.listen(port, () => console.log(`CollectorCheck listening on port ${port}`));
}

module.exports = app;