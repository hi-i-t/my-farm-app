import { Plant } from "../types/plant";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// 作物一覧を取得
export const getPlants = async (): Promise<Plant[]> => {
  const response = await fetch(`${API_BASE_URL}/plants`);
  if (!response.ok) throw new Error("Failed to fetch plants");
  const data = await response.json();

  return data.map((item: any) => ({
    id: String(item.id),
    name: item.name,
    type: item.type,
    farmType: item.farm_type || item.farmType || "spring",
    isArchived: item.is_archived ?? item.isArchived ?? false,
    plantedDate: item.planted_date || item.plantedDate || "",
    harvestDate: item.harvest_date || item.harvestDate || "",
    memo: item.memo || "",
    icon: item.icon || "",
    gridPosition:
      typeof item.grid_position === "object" && item.grid_position !== null
        ? item.grid_position
        : { x: 0, y: 0, w: 2, h: 2 },
  }));
};

// 作物を新規登録
export const createPlant = async (plant: Omit<Plant, "id">): Promise<Plant> => {
  const payload = {
    name: plant.name,
    type: plant.type,
    farm_type: plant.farmType,
    is_archived: plant.isArchived ?? false,
    planted_date: plant.plantedDate,
    harvest_date: plant.harvestDate,
    memo: plant.memo,
    icon: plant.icon,
    grid_position: plant.gridPosition,
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
    farmType: data.farm_type || plant.farmType,
    isArchived: data.is_archived ?? plant.isArchived,
    plantedDate: data.planted_date || "",
    harvestDate: data.harvest_date || "",
    memo: data.memo || "",
    icon: data.icon || plant.icon || "",
    gridPosition: data.grid_position || plant.gridPosition,
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
    farm_type: plant.farmType,
    is_archived: plant.isArchived ?? false,
    planted_date: plant.plantedDate,
    harvest_date: plant.harvestDate,
    memo: plant.memo,
    icon: plant.icon,
    grid_position: plant.gridPosition,
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
    farmType: data.farm_type || plant.farmType,
    isArchived: data.is_archived ?? plant.isArchived,
    plantedDate: data.planted_date || "",
    harvestDate: data.harvest_date || "",
    memo: data.memo || "",
    icon: data.icon || plant.icon || "",
    gridPosition: data.grid_position || plant.gridPosition,
  };
};

// 作物を削除
export const deletePlant = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/plants/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete plant");
};
