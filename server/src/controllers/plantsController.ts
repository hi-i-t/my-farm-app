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

// --- ★追加: POST (新規登録) ---
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
