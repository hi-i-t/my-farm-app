import { Plant } from "../types/plant";

export const mockPlants: Plant[] = [
  {
    id: "1",
    name: "にんじん",
    type: "種",
    farmType: "spring",
    isArchived: false,
    plantedDate: "2026-10-01",
    harvestDate: "2026-11-01",
    memo: "日当たりの良い場所",
    gridPosition: { x: 0, y: 0, w: 2, h: 2 },
  },
];
