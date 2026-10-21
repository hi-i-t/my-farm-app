import express from "express";
import cors from "cors";
import plantsRouter from "./routes/plants";
import snapshotsRouter from "./routes/snapshots"; // スナップショットのルーター

const app = express();

app.use(cors());
app.use(express.json()); 

app.use("/api/plants", plantsRouter);
app.use("/api/snapshots", snapshotsRouter); // スナップショットのAPIのエンドポイントを登録

app.listen(3001, () => {
  console.log("Server is running on http://localhost:3001");
});
