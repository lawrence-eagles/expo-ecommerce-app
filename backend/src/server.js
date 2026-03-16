import express from "express";

const app = express();

app.get("/", (req, res) => res.status(200).json({ message: "Success" }));

app.listen(5000, () => console.log("Server is up and running"));
