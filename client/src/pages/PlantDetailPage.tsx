import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PlantForm } from "../components/PlantForm";
import { Plant } from "../types/plant";
import { updatePlant, deletePlant } from "../services/api";

export const PlantDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedPlant: Plant = location.state?.selectedPlant;

  if (!selectedPlant) {
    navigate("/farm");
    return null;
  }

  // すべてのボックスが最初からDBのIDを持っているため、保存は常に updatePlant（更新）に一本化する
  const handleSave = async (updatedPlant: Plant) => {
    try {
      if (!updatedPlant.id) {
        throw new Error("更新対象のIDが見つかりません。");
      }

      // 常に updatePlant を実行して、選択した名前やアイコンを確実に上書き保存する
      await updatePlant(updatedPlant.id, updatedPlant);

      navigate("/farm");
    } catch (error) {
      console.error("データの保存に失敗しました:", error);
      alert("保存処理中にエラーが発生しました。");
    }
  };

  const handleDelete = async (id?: string) => {
    try {
      // 本物のDB IDならAPIで削除
      if (id && !id.startsWith("init-") && !id.startsWith("new-")) {
        await deletePlant(id);
      }
      navigate("/farm");
    } catch (error) {
      console.error("データの削除に失敗しました:", error);
      alert("削除処理中にエラーが発生しました。");
    }
  };

  return (
    <PlantForm
      selectedPlant={selectedPlant}
      onSave={handleSave}
      onDelete={handleDelete}
      onBack={() => navigate("/farm")}
    />
  );
};
