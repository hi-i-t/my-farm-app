import { Router } from "express";
import {
  getPlants,
  createPlant,
  updatePlant,
  deletePlant,
} from "../controllers/plantsController";

const router = Router();

router.get("/", getPlants);
router.post("/", createPlant);
router.put("/:id", updatePlant); // ★追加
router.delete("/:id", deletePlant); // ★追加

export default router;
