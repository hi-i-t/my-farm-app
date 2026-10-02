import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutItem } from "react-grid-layout";
import { PlantCard } from "../components/PlantCard";
import { Plant } from "../types/plant";
import { getPlants, createPlant } from "../services/api";

// 初期設定：設計図通りの8つの空Box（春・秋用）
const generateInitialBoxes = (farmType: "spring" | "autumn"): Plant[] => {
  return Array.from({ length: 8 }, (_, index) => ({
    id: `init-${farmType}-${index}`,
    name: "",
    type: "種",
    farmType,
    isArchived: false,
    plantedDate: "",
    harvestDate: "",
    memo: "",
    icon: "",
    gridPosition: {
      x: (index % 2) * 2,
      y: Math.floor(index / 2) * 2,
      w: 2,
      h: 2,
    },
  }));
};

export const FarmPage: React.FC = () => {
  const navigate = useNavigate();
  const [farmType, setFarmType] = useState<"spring" | "autumn">("spring");
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [plants, setPlants] = useState<Plant[]>(() => [
    ...generateInitialBoxes("spring"),
    ...generateInitialBoxes("autumn"),
  ]);

  // 初回のみ空ボックスを自動作成し、基本はDBのデータをそのままセットする
  const fetchPlants = useCallback(async () => {
    try {
      let data = await getPlants();

      // データベースが空なら、最初から空ボックスをDBへ自動登録する
      if (!data || data.length === 0) {
        const initialSpring = generateInitialBoxes("spring");
        const initialAutumn = generateInitialBoxes("autumn");
        const allInitials = [...initialSpring, ...initialAutumn];

        for (const box of allInitials) {
          const { id, ...boxWithoutId } = box;
          await createPlant(boxWithoutId);
        }
        data = await getPlants();
      }

      if (data && data.length > 0) {
        setPlants(data); // データベースから取得した本物のID付きデータをそのまま反映
      }
    } catch (err) {
      console.error("データ取得エラー:", err);
    }
  }, []);
  // 画面マウント時にデータ取得
  useEffect(() => {
    fetchPlants();
  }, [fetchPlants]);

  // React Router でこのページに戻ってきたとき（フォーカス時など）にデータを再取得する
  useEffect(() => {
    fetchPlants();
  }, [navigate, fetchPlants]);

  // レイアウト変更時
  const handleLayoutChange = (newLayout: readonly LayoutItem[]) => {
    setPlants((prev) =>
      prev.map((plant, idx) => {
        const match = newLayout.find(
          (l) => l.i === (plant.id || `temp-${idx}`),
        );
        if (match) {
          return {
            ...plant,
            gridPosition: { x: match.x, y: match.y, w: match.w, h: match.h },
          };
        }
        return plant;
      }),
    );
  };

  // 空Boxまたは作成済みBoxをタップしたとき -> 詳細ページへReact Routerで遷移
  const handleSelectBox = (plant: Plant) => {
    if (showArchived) return; // 過去データ閲覧時は編集不可
    navigate("/detail", { state: { selectedPlant: plant, plants } });
  };

  const handleAddBox = async () => {
    // 型（Omit<Plant, "id">）を明示してTypeScriptのエラーを防止
    const newBoxData: Omit<Plant, "id"> = {
      name: "新しい作物",
      type: "種",
      farmType,
      isArchived: false,
      plantedDate: "",
      harvestDate: "",
      memo: "",
      icon: "", // アイコンの初期値
      gridPosition: { x: 0, y: 0, w: 2, h: 2 },
    };

    try {
      // データベースに新規作成を保存
      const created = await createPlant(newBoxData);
      setPlants((prev) => [...prev, created]);
    } catch (err) {
      console.error("ボックス追加エラー:", err);
      // 万が一APIが失敗したときのフォールバック
      const tempBox: Plant = {
        id: `new-${Date.now()}`,
        ...newBoxData,
      };
      setPlants((prev) => [...prev, tempBox]);
    }
  };

  return (
    <PlantCard
      plants={plants}
      farmType={farmType}
      showArchived={showArchived}
      onSelectBox={handleSelectBox}
      onAddBox={handleAddBox}
      onSwitchFarm={(type: "spring" | "autumn") => setFarmType(type)}
      onToggleArchive={() => setShowArchived(!showArchived)}
      onGoToTop={() => navigate("/")}
      onLayoutChange={handleLayoutChange}
    />
  );
};
