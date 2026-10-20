import { Router } from "express";
import {
  createSnapshot,
  getSnapshots,
  getSnapshotItems,
} from "../controllers/snapshotsController";

const router = Router();

// POST: スナップショットを新規保存する
router.post("/", createSnapshot);

// GET: スナップショットの一覧を取得する
router.get("/", getSnapshots);

// GET: 特定のスナップショットのアイテム一覧を取得する
router.get("/:id/items", getSnapshotItems);

export default router;


