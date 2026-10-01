import { Plant } from "../types/plant";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";
// 作物一覧を取得
export const fetchPlants = async (): Promise<Plant[]> => {
  const response = await fetch(`${API_BASE_URL}/plants`);
  if (!response.ok) throw new Error("Failed to fetch plants");
  const data = await response.json();

  // バックエンドの planted_date を フロントエンドの plantedDate に変換
  return data.map((item: any) => ({
    id: String(item.id),
    name: item.name,
    type: item.type,
    plantedDate: item.planted_date || item.plantedDate || "",
    harvestDate: item.harvest_date || item.harvestDate || "",
    memo: item.memo || "",
    gridPosition: item.grid_position || item.gridPosition || 0,
  }));
};

// 作物を新規登録
export const createPlant = async (plant: Omit<Plant, "id">): Promise<Plant> => {
  const payload = {
    name: plant.name,
    type: plant.type,
    planted_date: plant.plantedDate,
  };

  const response = await fetch(`${API_BASE_URL}/plants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to create plant");
  const data = await response.json();

  return {
    id: String(data.id),
    name: data.name,
    type: data.type,
    plantedDate: data.planted_date || data.plantedDate || "",
    harvestDate: data.harvest_date || data.harvestDate || "",
    memo: data.memo || "",
    gridPosition: data.grid_position || data.gridPosition || 0,
  };
};

// 作物を更新
export const updatePlant = async (
  id: string,
  plant: Omit<Plant, "id">,
): Promise<Plant> => {
  const payload = {
    name: plant.name,
    type: plant.type,
    planted_date: plant.plantedDate,
  };

  const response = await fetch(`${API_BASE_URL}/plants/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to update plant");
  const data = await response.json();

  return {
    id: String(data.id),
    name: data.name,
    type: data.type,
    plantedDate: data.planted_date || data.plantedDate || "",
    harvestDate: data.harvest_date || data.harvestDate || "",
    memo: data.memo || "",
    gridPosition: data.grid_position || data.gridPosition || 0,
  };
};

// 作物を削除
export const deletePlant = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/plants/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete plant");
};
