import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PlantForm } from "../components/PlantForm";
import { Plant } from "../types/plant";
import { getPlant, updatePlant, deletePlant } from "../services/api";

export const PlantDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { farmType, id } = useParams();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [error, setError] = useState<string | null>(null);

  const backToFarm = () => navigate(`/farm/${farmType}`);

  // URLのIDからDBのデータを読み込む（リロードしても表示できる）
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getPlant(id)
      .then((data) => {
        if (!cancelled) setPlant(data);
      })
      .catch((err) => {
        console.error("データ取得エラー:", err);
        if (!cancelled) setError("Boxが見つかりませんでした。");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSave = async (updatedPlant: Plant) => {
    if (!id) return;
    try {
      // 位置(gridPosition)やファームは変えず、入力内容だけを更新する
      await updatePlant(id, {
        name: updatedPlant.name,
        type: updatedPlant.type,
        icon: updatedPlant.icon,
        plantedDate: updatedPlant.plantedDate,
        harvestDate: updatedPlant.harvestDate,
        memo: updatedPlant.memo,
      });
      backToFarm();
    } catch (err) {
      console.error("データの保存に失敗しました:", err);
      alert("保存処理中にエラーが発生しました。");
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm("このBoxを削除しますか？")) return;
    try {
      await deletePlant(id);
      backToFarm();
    } catch (err) {
      console.error("データの削除に失敗しました:", err);
      alert("削除処理中にエラーが発生しました。");
    }
  };

  if (error) {
    return (
      <div style={{ textAlign: "center", paddingTop: "60px" }}>
        <p>{error}</p>
        <button onClick={backToFarm}>メイン画面へ戻る</button>
      </div>
    );
  }

  if (!plant) {
    return (
      <p style={{ textAlign: "center", paddingTop: "60px", color: "#aaa" }}>
        読み込み中…
      </p>
    );
  }

  return (
    <PlantForm
      key={plant.id}
      selectedPlant={plant}
      onSave={handleSave}
      onDelete={handleDelete}
      onBack={backToFarm}
    />
  );
};
