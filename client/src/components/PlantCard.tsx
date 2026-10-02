import React from "react";
import ReactGridLayout, {
  useContainerWidth,
  LayoutItem,
} from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Plant } from "../types/plant";

interface Props {
  plants: Plant[];
  farmType: "spring" | "autumn";
  showArchived: boolean;
  onSelectBox: (plant: Plant) => void;
  onAddBox: () => void;
  onSwitchFarm: (type: "spring" | "autumn") => void;
  onToggleArchive: () => void;
  onGoToTop: () => void;
  onLayoutChange?: (newLayout: readonly LayoutItem[]) => void;
}

export const PlantCard: React.FC<Props> = ({
  plants,
  farmType,
  showArchived,
  onSelectBox,
  onAddBox,
  onSwitchFarm,
  onToggleArchive,
  onGoToTop,
  onLayoutChange,
}) => {
  const { width, containerRef, mounted } = useContainerWidth();

  // 表示する植物データの絞り込み
  const currentPlants = plants.filter(
    (p) =>
      p.farmType === farmType && (showArchived ? p.isArchived : !p.isArchived),
  );

  // 位置の定義（左列: 7, 5, 3, 1 / 右列: 8, 6, 4, 2）
  const slotPositions: Record<number, { x: number; y: number }> = {
    7: { x: 0, y: 0 },
    8: { x: 1, y: 0 },
    5: { x: 0, y: 1 },
    6: { x: 1, y: 1 },
    3: { x: 0, y: 2 },
    4: { x: 1, y: 2 },
    1: { x: 0, y: 3 },
    2: { x: 1, y: 3 },
  };

  const slotOrder = [7, 8, 5, 6, 3, 4, 1, 2];

  // 1〜8のスロットにデータを割り当て
  const slots = slotOrder.map((slotNum, index) => ({
    slotNum,
    plant: currentPlants[index],
  }));

  // レイアウト配列の作成
  const layout: readonly LayoutItem[] = slots.map((slot) => {
    const pos = slotPositions[slot.slotNum];
    const itemId =
      slot.plant && slot.plant.id
        ? String(slot.plant.id)
        : `slot-${slot.slotNum}`;

    return {
      i: itemId,
      x: pos.x,
      y: pos.y,
      w: 1,
      h: 1,
    };
  });

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "430px",
        margin: "0 auto",
        padding: "15px",
        backgroundColor: farmType === "spring" ? "#eef7ee" : "#fdf3e7",
        minHeight: "100vh",
        boxSizing: "border-box",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      }}
    >
      {/* ヘッダー */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.2rem", color: "#333" }}>
          {farmType === "spring" ? "春ファーム" : "秋ファーム"}{" "}
          {showArchived && "(過去データ)"}
        </h2>
        <button
          onClick={onToggleArchive}
          style={{
            backgroundColor: showArchived ? "#ffc107" : "#ffffff",
            border: "1px solid #ccc",
            padding: "5px 10px",
            borderRadius: "4px",
            fontSize: "12px",
            cursor: "pointer",
          }}
        >
          {showArchived ? "現在のデータ" : "過去のデータ"}
        </button>
      </div>

      {/* メインエリア */}
      <div
        ref={containerRef}
        style={{
          border: "2px dashed #b0b0b0",
          borderRadius: "8px",
          minHeight: "400px",
          padding: "10px",
          backgroundColor: "#ffffff",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {mounted && (
          <ReactGridLayout
            layout={layout}
            width={width}
            gridConfig={{
              cols: 2,
              rowHeight: 80,
              margin: [10, 10],
            }}
            dragConfig={{
              enabled: !showArchived,
            }}
            resizeConfig={{
              enabled: false,
            }}
            onLayoutChange={(newLayout) =>
              onLayoutChange && onLayoutChange(newLayout)
            }
          >
            {slots.map((slot) => {
              const plant = slot.plant;
              const itemKey =
                plant && plant.id ? String(plant.id) : `slot-${slot.slotNum}`;

              // クリック時の処理（データがあればそのまま渡し、無ければ新規用オブジェクトを渡す）
              const handleClick = () => {
                if (plant) {
                  onSelectBox(plant);
                } else {
                  onSelectBox({
                    id: `new-${Date.now()}`,
                    name: "",
                    farmType: farmType,
                    isArchived: showArchived,
                  } as Plant);
                }
              };

              return (
                <div
                  key={itemKey}
                  onClick={handleClick}
                  style={{
                    border: "1px solid #888",
                    borderRadius: "8px",
                    backgroundColor: "#fafafa",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "1px 1px 3px rgba(0,0,0,0.1)",
                    userSelect: "none",
                    padding: "4px 8px",
                    boxSizing: "border-box",
                    overflow: "hidden",
                  }}
                >
                  {plant && plant.name ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {/* アイコンが存在する場合に表示 */}
                      {plant.icon && (
                        <span style={{ fontSize: "18px" }}>{plant.icon}</span>
                      )}
                      <span
                        style={{
                          fontWeight: "bold",
                          fontSize: "14px",
                          color: "#333",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {plant.icon}
                        {plant.name}
                      </span>
                    </div>
                  ) : (
                    <span style={{ color: "#aaa", fontSize: "13px" }}>
                      空Box
                    </span>
                  )}
                </div>
              );
            })}
          </ReactGridLayout>
        )}
      </div>

      {/* フッター */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "8px",
          marginTop: "15px",
        }}
      >
        <button
          onClick={onGoToTop}
          style={{
            flex: 1,
            padding: "8px 0",
            fontSize: "12px",
            border: "1px solid #aaa",
            borderRadius: "4px",
            backgroundColor: "#fff",
            cursor: "pointer",
          }}
        >
          終了
        </button>
        <button
          onClick={onAddBox}
          disabled={showArchived}
          style={{
            flex: 1,
            padding: "8px 0",
            fontSize: "12px",
            border: "1px solid #aaa",
            borderRadius: "4px",
            backgroundColor: "#fff",
            cursor: "pointer",
          }}
        >
          BOXを追加
        </button>
        <button
          onClick={() =>
            onSwitchFarm(farmType === "spring" ? "autumn" : "spring")
          }
          style={{
            flex: 1,
            padding: "8px 0",
            fontSize: "12px",
            border: "1px solid #aaa",
            borderRadius: "4px",
            backgroundColor: "#fff",
            cursor: "pointer",
          }}
        >
          {farmType === "spring" ? "秋ファームへ" : "春ファームへ"}
        </button>
      </div>
    </div>
  );
};
