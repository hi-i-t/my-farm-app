import { createClient } from "@supabase/supabase-js";
import { Plant } from "../types/plant";

// Viteの環境変数からSupabaseのURLとAnon Keyを取得
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey);

// スナップショットの型定義
export interface Snapshot {
  id: number;
  farm_type: string;
  title: string;
  created_at: string;
}

// ==========================================
// データベースの形 ➔ 画面の形 に変換する関数
// ==========================================
const mapFromDb = (item: any): Plant => {
  return {
    id: item.id,
    name: item.name,
    type: item.type,
    icon: item.icon,
    plantedDate: item.planted_date,
    harvestDate: item.harvest_date,
    memo: item.memo,
    farmType: item.farmType,
    isArchived: item.isArchived,
    gridPosition: item.gridPosition,
  };
};

// ==========================================
// 画面の形 ➔ データベースの形 に変換する関数
// ==========================================
const mapToDb = (plant: Partial<Plant>) => {
  return {
    name: plant.name,
    type: plant.type,
    icon: plant.icon,
    planted_date: plant.plantedDate, // 画面の形をデータベースの形（アンダーバー付き）に
    harvest_date: plant.harvestDate,
    memo: plant.memo,
    farm_type: plant.farmType,
    is_archived: plant.isArchived,
    grid_position: plant.gridPosition,
  };
};

// ==========================================
// 作物（Plant / Box）関連のAPI
// ==========================================

// 作物一覧を取得
export const getPlants = async (): Promise<Plant[]> => {
  const { data, error } = await supabase.from("plants").select("*");
  if (error) throw new Error(error.message);
  return (data || []).map(mapFromDb);
};

// 作物を1件取得
export const getPlant = async (id: string): Promise<Plant> => {
  const { data, error } = await supabase
    .from("plants")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return mapFromDb(data);
};

// 作物を新規登録
export const createPlant = async (plant: Omit<Plant, "id">): Promise<Plant> => {
  const dbData = mapToDb(plant);
  const { data, error } = await supabase
    .from("plants")
    .insert([dbData])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapFromDb(data);
};

// 作物をまとめて登録（初期の空Box作成用など）
export const createPlants = async (
  plants: Omit<Plant, "id">[],
): Promise<Plant[]> => {
  const dbDataArray = plants.map(mapToDb);
  const { data, error } = await supabase
    .from("plants")
    .insert(dbDataArray)
    .select();
  if (error) throw new Error(error.message);
  return (data || []).map(mapFromDb);
};

// 作物を更新
export const updatePlant = async (
  id: string,
  plant: Partial<Omit<Plant, "id">>,
): Promise<Plant> => {
  const dbData = mapToDb(plant);
  const { data, error } = await supabase
    .from("plants")
    .update(dbData)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapFromDb(data);
};

// 作物を削除
export const deletePlant = async (id: string): Promise<{ message: string }> => {
  const { error } = await supabase.from("plants").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { message: "Deleted successfully" };
};

// ==========================================
// スナップショット関連のAPI
// ==========================================

// スナップショットを保存する
export const createSnapshot = async (farmType: string, title: string) => {
  const { data, error } = await supabase
    .from("snapshots")
    .insert([{ farm_type: farmType, title }])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return { message: "Saved successfully", snapshot: data };
};

// スナップショットの一覧を取得する
export const getSnapshots = async (): Promise<Snapshot[]> => {
  const { data, error } = await supabase.from("snapshots").select("*");
  if (error) throw new Error(error.message);
  return data || [];
};

// 特定のスナップショットのアイテム一覧を取得する
export const getSnapshotItems = async (
  snapshotId: number,
): Promise<Plant[]> => {
  const { data, error } = await supabase
    .from("snapshot_items")
    .select("*")
    .eq("snapshot_id", snapshotId);
  if (error) throw new Error(error.message);
  return (data || []).map(mapFromDb);
};
