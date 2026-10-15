import { Request, Response } from "express";
import { supabase } from "../db/supabaseClient";

// ★ APIでやり取りする形（キャメルケース）と、Supabaseの実際の列名の対応表
//   DBの列名: id, name, type, icon, memo, planted_date, harvest_date, farmType, gridPosition, isArchived
const FIELD_TO_COLUMN = {
  name: "name",
  type: "type",
  icon: "icon",
  memo: "memo",
  plantedDate: "planted_date",
  harvestDate: "harvest_date",
  farmType: "farmType",
  gridPosition: "gridPosition",
  isArchived: "isArchived",
} as const;

type Field = keyof typeof FIELD_TO_COLUMN;

// 空文字 "" の日付は null に変換する（日付エラー対策）
const toNullableDate = (value: unknown) =>
  typeof value === "string" && value.trim() !== "" ? value : null;

// gridPosition は文字列で保存されていても読めるようにしておく
const parseGridPosition = (value: unknown) => {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return value ?? null;
};

// リクエストボディ（キャメルケース）→ DBの行
// 送られてきた項目だけを含めるので、PUTでは一部だけの更新もできる
const toRow = (body: Record<string, unknown>) => {
  const row: Record<string, unknown> = {};
  for (const field of Object.keys(FIELD_TO_COLUMN) as Field[]) {
    if (body[field] === undefined) continue;
    const value =
      field === "plantedDate" || field === "harvestDate"
        ? toNullableDate(body[field])
        : body[field];
    row[FIELD_TO_COLUMN[field]] = value;
  }
  return row;
};

// DBの行 → レスポンス（キャメルケース）
const toPlant = (row: any) => ({
  id: String(row.id),
  name: row.name ?? "",
  type: row.type ?? "種",
  icon: row.icon ?? "",
  memo: row.memo ?? "",
  plantedDate: row.planted_date ?? "",
  harvestDate: row.harvest_date ?? "",
  farmType: row.farmType ?? "spring",
  gridPosition: parseGridPosition(row.gridPosition),
  isArchived: row.isArchived ?? false,
});

// --- GET (一覧取得) ---
export const getPlants = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("plants")
      .select("*")
      .order("id");
    if (error) throw error;
    res.json(data.map(toPlant));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// --- GET (1件取得) ---  詳細画面をリロードしても表示できるようにする
export const getPlant = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("plants")
      .select("*")
      .eq("id", Number(req.params.id))
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: "Plant not found" });
      return;
    }
    res.json(toPlant(data));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// --- POST (新規登録) ---  1件でも配列（まとめて登録）でも受け取れる
export const createPlant = async (req: Request, res: Response) => {
  try {
    const isBulk = Array.isArray(req.body);
    const rows = (isBulk ? req.body : [req.body]).map(toRow);

    const { data, error } = await supabase.from("plants").insert(rows).select();

    if (error) throw error;
    const plants = data.map(toPlant);
    res.status(201).json(isBulk ? plants : plants[0]);
  } catch (error: any) {
    console.error("❌ 登録エラー:", error);
    res.status(500).json({ error: error.message });
  }
};

// --- PUT (更新) ---
export const updatePlant = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("plants")
      .update(toRow(req.body))
      .eq("id", Number(req.params.id))
      .select();

    if (error) throw error;
    if (data.length === 0) {
      res.status(404).json({ error: "Plant not found" });
      return;
    }
    res.json(toPlant(data[0]));
  } catch (error: any) {
    console.error("❌ 更新エラー:", error);
    res.status(500).json({ error: error.message });
  }
};

// --- DELETE (削除) ---
export const deletePlant = async (req: Request, res: Response) => {
  try {
    const { error } = await supabase
      .from("plants")
      .delete()
      .eq("id", Number(req.params.id));

    if (error) throw error;
    res.json({ message: "Plant deleted successfully" });
  } catch (error: any) {
    console.error("❌ 削除エラー:", error);
    res.status(500).json({ error: error.message });
  }
};
