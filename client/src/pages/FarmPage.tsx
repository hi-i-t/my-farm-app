import React, { useState, useEffect, useRef } from "react";
import {
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { PlantCard } from "../components/PlantCard";
import { FarmType, GridPosition, Plant } from "../types/plant";
import {
  getPlants,
  createPlant,
  createPlants,
  updatePlant,
} from "../services/api";

const isFarmType = (value: unknown): value is FarmType =>
  value === "spring" || value === "autumn";

// 初期設定：設計図通りの8つの空Box（2列×4段）
const generateInitialBoxes = (farmType: FarmType): Omit<Plant, "id">[] =>
  Array.from({ length: 8 }, (_, index) => ({
    name: "",
    type: "種",
    farmType,
    isArchived: false,
    plantedDate: "",
    harvestDate: "",
    memo: "",
    icon: "",
    gridPosition: { x: index % 2, y: Math.floor(index / 2), w: 1, h: 1 },
  }));

export const FarmPage: React.FC = () => {
  const navigate = useNavigate();
  const { farmType } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const showArchived = searchParams.get("archived") === "1";

  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // 空Boxの自動作成を1回だけにする（StrictModeでeffectが2回走っても重複しない）
  // 2回目のeffectも同じ作成処理の結果を待てるよう、Promiseを保持しておく
  const seedingRef = useRef<Map<FarmType, Promise<Plant[]>>>(new Map());

  // このページを表示するたびに（詳細画面から戻ったときも）DBから読み直す
  useEffect(() => {
    if (!isFarmType(farmType)) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        let data = await getPlants();

        // このファームの現在データが1件も無ければ、空Boxを8つDBへ登録する
        const hasCurrent = data.some(
          (p) => p.farmType === farmType && !p.isArchived,
        );
        if (!hasCurrent) {
          let seeding = seedingRef.current.get(farmType);
          if (!seeding) {
            seeding = createPlants(generateInitialBoxes(farmType));
            seedingRef.current.set(farmType, seeding);
            seeding.catch(() => seedingRef.current.delete(farmType));
          }
          const created = await seeding;
          const ids = new Set(data.map((p) => p.id));
          data = [...data, ...created.filter((p) => !ids.has(p.id))];
        }

        if (!cancelled) {
          setPlants(data);
          setError(null);
        }
      } catch (err) {
        console.error("データ取得エラー:", err);
        if (!cancelled) setError("データの取得に失敗しました。");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [farmType]);

  if (!isFarmType(farmType)) {
    return <Navigate to="/farm/spring" replace />;
  }

  const currentPlants = plants.filter(
    (p) =>
      p.farmType === farmType && (showArchived ? p.isArchived : !p.isArchived),
  );

  // ドラッグで並べ替えたとき：位置が変わったBoxだけDBに保存する
  const handleLayoutSave = async (positions: Record<string, GridPosition>) => {
    const changed = currentPlants.filter((p) => {
      const next = p.id ? positions[p.id] : undefined;
      const prev = p.gridPosition;
      return (
        next &&
        (!prev ||
          prev.x !== next.x ||
          prev.y !== next.y ||
          prev.w !== next.w ||
          prev.h !== next.h)
      );
    });
    if (changed.length === 0) return;

    setPlants((prev) =>
      prev.map((p) =>
        p.id && positions[p.id] ? { ...p, gridPosition: positions[p.id] } : p,
      ),
    );

    try {
      await Promise.all(
        changed.map((p) =>
          updatePlant(p.id!, { gridPosition: positions[p.id!] }),
        ),
      );
    } catch (err) {
      console.error("レイアウト保存エラー:", err);
      setError("配置の保存に失敗しました。");
    }
  };

  // Boxをタップしたとき -> 詳細ページへ
  const handleSelectBox = (plant: Plant) => {
    if (showArchived || !plant.id) return; // 過去データ閲覧時は編集不可
    navigate(`/farm/${farmType}/plants/${plant.id}`);
  };

  // BOXを追加：一番下の段に空BoxをDBへ登録する
  const handleAddBox = async () => {
    const bottom = currentPlants.reduce(
      (max, p) => (p.gridPosition ? Math.max(max, p.gridPosition.y + p.gridPosition.h) : max),
      0,
    );
    try {
      const created = await createPlant({
        name: "",
        type: "種",
        farmType,
        isArchived: false,
        plantedDate: "",
        harvestDate: "",
        memo: "",
        icon: "",
        gridPosition: { x: 0, y: bottom, w: 1, h: 1 },
      });
      setPlants((prev) => [...prev, created]);
    } catch (err) {
      console.error("ボックス追加エラー:", err);
      setError("Boxの追加に失敗しました。");
    }
  };

  return (
    <PlantCard
      plants={currentPlants}
      farmType={farmType}
      showArchived={showArchived}
      loading={loading}
      error={error}
      onSelectBox={handleSelectBox}
      onAddBox={handleAddBox}
      onSwitchFarm={(type) => navigate(`/farm/${type}`)}
      onToggleArchive={() =>
        setSearchParams(showArchived ? {} : { archived: "1" })
      }
      onGoToTop={() => navigate("/")}
      onLayoutSave={handleLayoutSave}
    />
  );
};
