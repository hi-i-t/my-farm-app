import { Request, Response } from "express";
import { supabase } from "../db/supabaseClient";

// --- 既存の GET (一覧取得) ---
export const getPlants = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from("plants").select("*");
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// --- POST (新規登録) ---
export const createPlant = async (req: Request, res: Response) => {
  try {
    // ★ gridPosition, farmType, icon などを追加で受け取るようにする
    const {
      name,
      type,
      farmType,
      gridPosition,
      icon,
      plantedDate,
      harvestDate,
      memo,
      isArchived,
    } = req.body;

    const { data, error } = await supabase
      .from("plants")
      .insert([
        {
          name,
          type,
          farm_type: farmType, // farm_type に合わせる
          grid_position: gridPosition, // grid_position に合わせる
          icon,
          planted_date: plantedDate,
          harvest_date: harvestDate,
          memo,
          is_archived: isArchived,
        },
      ])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// --- PUT (更新) ---
export const updatePlant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // 更新時も同様にすべての項目を受け取るようにする
    const {
      name,
      type,
      farmType,
      gridPosition,
      icon,
      plantedDate,
      harvestDate,
      memo,
      isArchived,
    } = req.body;

    const { data, error } = await supabase
      .from("plants")
      .update({
        name,
        type,
        farm_type: farmType,
        grid_position: gridPosition,
        icon,
        planted_date: plantedDate,
        harvest_date: harvestDate,
        memo,
        isArchived,
      })
      .eq("id", id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// ---  DELETE (削除) ---
export const deletePlant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("plants").delete().eq("id", id);

    if (error) throw error;
    res.json({ message: "Plant deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
