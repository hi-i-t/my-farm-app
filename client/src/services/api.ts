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
// 作物（Plant / Box）関連のAPI
// ==========================================

// 作物一覧を取得
export const getPlants = async (): Promise<Plant[]> => {
  const { data, error } = await supabase.from("plants").select("*");
  if (error) throw new Error(error.message);
  return data || [];
};

// 作物を1件取得
export const getPlant = async (id: string): Promise<Plant> => {
  const { data, error } = await supabase
    .from("plants")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// 作物を新規登録
export const createPlant = async (plant: Omit<Plant, "id">): Promise<Plant> => {
  const { data, error } = await supabase
    .from("plants")
    .insert([plant])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// 作物をまとめて登録（初期の空Box作成用など）
export const createPlants = async (plants: Omit<Plant, "id">[]): Promise<Plant[]> => {
  const { data, error } = await supabase
    .from("plants")
    .insert(plants)
    .select();
  if (error) throw new Error(error.message);
  return data || [];
};

// 作物を更新
export const updatePlant = async (id: string, plant: Partial<Omit<Plant, "id">>): Promise<Plant> => {
  const { data, error } = await supabase
    .from("plants")
    .update(plant)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
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
export const getSnapshotItems = async (snapshotId: number): Promise<Plant[]> => {
  const { data, error } = await supabase
    .from("snapshot_items")
    .select("*")
    .eq("snapshot_id", snapshotId);
  if (error) throw new Error(error.message);
  return data || [];
};