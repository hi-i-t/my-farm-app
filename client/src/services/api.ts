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
    id: String(item.id),
    name: item.name,
    type: item.type,
    icon: item.icon,
   // 日付もアンダーバーあり・なし両方に対応
    plantedDate: item.planted_date || item.plantedDate || "",
    harvestDate: item.harvest_date || item.harvestDate || "",
    memo: item.memo,
    // ファームタイプも両方に対応
    farmType: item.farm_type || item.farmType,
    isArchived: item.is_archived || item.isArchived,
    gridPosition: item.grid_position || item.gridPosition,
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
    farmType: plant.farmType,
    isArchived: plant.isArchived,
    gridPosition: plant.gridPosition,
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
    .eq("id", Number(id))
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
    .eq("id", Number(id))
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

// スナップショットを保存する（親データの作成 ＋ snapshot_items へのデータコピー）
export const createSnapshot = async (farmType: string, title: string) => {
  if (!farmType || !title) {
    throw new Error("farmType と title は必須です。");
  }

  // 1. snapshots テーブルに親データを挿入
  const { data: snapshotData, error: snapshotError } = await supabase
    .from("snapshots")
    .insert([{ farm_type: farmType, title }])
    .select()
    .single();

  if (snapshotError) throw new Error(snapshotError.message);
  const snapshotId = snapshotData.id;

  // 2. 現在の plants テーブルから該当する farmType のデータを取得
  const { data: plantsData, error: plantsError } = await supabase
    .from("plants")
    .select("*")
    .eq("farmType", farmType);

  if (plantsError) throw new Error(plantsError.message);

  // 3. 取得した植物データを snapshot_items テーブル用に整形して一括挿入
  if (plantsData && plantsData.length > 0) {
    const snapshotItems = plantsData.map((plant: any) => ({
      snapshot_id: snapshotId,
      name: plant.name ?? "",
      type: plant.type ?? "種",
      icon: plant.icon ?? "",
      memo: plant.memo ?? "",
      planted_date: plant.planted_date ?? null,
      harvest_date: plant.harvest_date ?? null,
      farm_type: plant.farmType ?? farmType,
      grid_position: plant.gridPosition ?? null,
      is_archived: plant.isArchived ?? false,
    }));

    const { error: itemsError } = await supabase
      .from("snapshot_items")
      .insert(snapshotItems);

    if (itemsError) throw new Error(itemsError.message);
  }

  return { message: "Saved successfully", snapshot: snapshotData };
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
