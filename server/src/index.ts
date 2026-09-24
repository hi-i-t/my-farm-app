import express from "express";
import cors from "cors";
import plantsRouter from "./routes/plants";

const app = express();

app.use(cors());
app.use(express.json()); // ★これが無いとデータを受け取れません！

app.use("/api/plants", plantsRouter);

app.listen(3001, () => {
  console.log("Server is running on http://localhost:3001");
});
