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
    const { name, type, planted_date } = req.body;

    const { data, error } = await supabase
      .from("plants")
      .insert([{ name, type, planted_date }])
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
    const { name, type, planted_date } = req.body;

    const { data, error } = await supabase
      .from("plants")
      .update({ name, type, planted_date })
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
