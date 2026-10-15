import { Router } from "express";
import {
  getPlants,
  getPlant,
  createPlant,
  updatePlant,
  deletePlant,
} from "../controllers/plantsController";

const router = Router();

router.get("/", getPlants);
router.get("/:id", getPlant);
router.post("/", createPlant);
router.put("/:id", updatePlant);
router.delete("/:id", deletePlant);

export default router;
