import { Plant } from "../types/plant";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// スナップショットの型定義
export interface Snapshot {
  id: number;
  farm_type: string;
  title: string;
  created_at: string;
}

//  DBの列名との変換はサーバー側で行うので、クライアントは Plant 型（キャメルケース）のままやり取りする
const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `API error: ${response.status}`);
  }
  return response.json();
};

// 作物一覧を取得
export const getPlants = () => request<Plant[]>("/plants");

// 作物を1件取得
export const getPlant = (id: string) => request<Plant>(`/plants/${id}`);

// 作物を新規登録
export const createPlant = (plant: Omit<Plant, "id">) =>
  request<Plant>("/plants", { method: "POST", body: JSON.stringify(plant) });

// 作物をまとめて登録（初期の空Box作成用）
export const createPlants = (plants: Omit<Plant, "id">[]) =>
  request<Plant[]>("/plants", { method: "POST", body: JSON.stringify(plants) });

// 作物を更新（送った項目だけが更新される）
export const updatePlant = (id: string, plant: Partial<Omit<Plant, "id">>) =>
  request<Plant>(`/plants/${id}`, {
    method: "PUT",
    body: JSON.stringify(plant),
  });

// 作物を削除
export const deletePlant = (id: string) =>
  request<{ message: string }>(`/plants/${id}`, { method: "DELETE" });

//スナップショット関連のAPI通信
// スナップショットを保存する
export const createSnapshot = (farmType: string, title: string) =>
  request<{ message: string; snapshot: Snapshot }>("/snapshots", {
    method: "POST",
    body: JSON.stringify({ farmType, title }),
  });

// スナップショットの一覧を取得する
export const getSnapshots = () => request<Snapshot[]>("/snapshots");

// 特定のスナップショットのアイテム一覧を取得する
export const getSnapshotItems = (snapshotId: number) =>
  request<Plant[]>(`/snapshots/${snapshotId}/items`);
