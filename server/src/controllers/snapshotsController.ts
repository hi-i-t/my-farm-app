import { Request, Response } from "express";
import { supabase } from "../db/supabaseClient";

// --- 1. スナップショットを保存する (POST) ---
// 現在の plants の中身（または特定の farmType）をコピーしてスナップショットとして保存する
export const createSnapshot = async (req: Request, res: Response) => {
  try {
    const { farmType, title } = req.body;

    if (!farmType || !title) {
      res.status(400).json({ error: "farmType と title は必須です。" });
      return;
    }

    // A. snapshots テーブルに親データを挿入
    const { data: snapshotData, error: snapshotError } = await supabase
      .from("snapshots")
      .insert([{ farm_type: farmType, title }])
      .select()
      .single();

    if (snapshotError) throw snapshotError;
    const snapshotId = snapshotData.id;

    // B. 現在の plants テーブルから該当するファームのデータを取得
    const { data: plantsData, error: plantsError } = await supabase
      .from("plants")
      .select("*")
      .eq("farmType", farmType);

    if (plantsError) throw plantsError;

    // C. 取得した植物データを snapshot_items テーブル用に整形して挿入
    if (plantsData && plantsData.length > 0) {
      const snapshotItems = plantsData.map((plant) => ({
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

      if (itemsError) throw itemsError;
    }

    res.status(201).json({
      message: "スナップショットを保存しました。",
      snapshot: snapshotData,
    });
  } catch (error: any) {
    console.error("❌ スナップショット保存エラー:", error);
    res.status(500).json({ error: error.message });
  }
};

// --- 2. スナップショットの一覧を取得する (GET) ---
export const getSnapshots = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("snapshots")
      .select("*")
      .order("created_at", { ascending: false }); // 新しい順

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error("❌ スナップショット一覧取得エラー:", error);
    res.status(500).json({ error: error.message });
  }
};

// --- 3. 特定のスナップショットに含まれるアイテム一覧を取得する (GET) ---
export const getSnapshotItems = async (req: Request, res: Response) => {
  try {
    const snapshotId = Number(req.params.id);

    const { data, error } = await supabase
      .from("snapshot_items")
      .select("*")
      .eq("snapshot_id", snapshotId);

    if (error) throw error;

    // フロントエンド側で扱いやすいようにキー名をキャメルケースなどに合わせる変換
    const formattedItems = data.map((item) => ({
      id: String(item.id),
      name: item.name ?? "",
      type: item.type ?? "種",
      icon: item.icon ?? "",
      memo: item.memo ?? "",
      plantedDate: item.planted_date ?? "",
      harvestDate: item.harvest_date ?? "",
      farmType: item.farm_type ?? "spring",
      gridPosition: item.grid_position,
      isArchived: item.is_archived ?? false,
    }));

    res.json(formattedItems);
  } catch (error: any) {
    console.error("❌ スナップショットアイテム取得エラー:", error);
    res.status(500).json({ error: error.message });
  }
};
