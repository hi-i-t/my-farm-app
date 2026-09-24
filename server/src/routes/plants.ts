import { Router } from "express";
import { getPlants, createPlant } from "../controllers/plantsController";

const router = Router();

router.get("/", getPlants);
router.post("/", createPlant); // ★追加

export default router;
