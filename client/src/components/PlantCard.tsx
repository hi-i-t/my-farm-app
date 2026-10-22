import React, { useRef, useState } from "react";
import ReactGridLayout, {
  useContainerWidth,
  Layout,
  LayoutItem,
} from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { FarmType, GridPosition, Plant } from "../types/plant";
import { getSnapshots, Snapshot } from "../services/api"; // スナップショット一覧取得用

interface Props {
  plants: Plant[]; // 表示するファームのBoxだけ渡す
  farmType: FarmType;
  showArchived: boolean;
  loading: boolean;
  error: string | null;
  onSelectBox: (plant: Plant) => void;
  onAddBox: () => void;
  onSwitchFarm: (type: FarmType) => void;
  onGoToTop: () => void;
  onLayoutSave: (positions: Record<string, GridPosition>) => void;
  onSaveSnapshot?: () => void; // スナップショット保存
  onLoadSnapshot?: (snapshotId: number, title: string) => void; // 過去データ読み込み
}

const COLS = 4;

// gridPosition から React-Grid-Layout 用のレイアウトを作る
// 位置が未保存のBox（null）は、配置済みBoxの下へ順番に並べる
// レイアウトを計算して組み立てる
const buildLayout = (plants: Plant[]): LayoutItem[] => {
  let nextY = plants.reduce(
    (max, p) =>
      p.gridPosition ? Math.max(max, p.gridPosition.y + p.gridPosition.h) : max,
    0,
  );

  let unplacedIndex = 0;

  return plants.map((plant) => {
    // 共通のサイズ制限（最小幅1、最大幅4、最小高1、最大高2など）
    const constraints = {
      minW: 1,
      maxW: 4, // COLSが4なので最大4まで
      minH: 1,
      maxH: 4, // 縦は最大4マス分までにする場合
    };

    if (plant.gridPosition) {
      return {
        i: plant.id!,
        ...plant.gridPosition,
        w: plant.gridPosition.w ?? 1,
        h: plant.gridPosition.h ?? 1,
        ...constraints,
      };
    }

    const x = unplacedIndex % COLS;
    const item = { i: plant.id!, x, y: nextY, w: 1, h: 1, ...constraints };
    unplacedIndex++;
    if (x === COLS - 1) nextY++;
    return item;
  });
};

const footerButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: "8px 0",
  fontSize: "12px",
  border: "1px solid #aaa",
  borderRadius: "4px",
  backgroundColor: "#fff",
  cursor: "pointer",
};

export const PlantCard: React.FC<Props> = ({
  plants,
  farmType,
  showArchived,
  loading,
  error,
  onSelectBox,
  onAddBox,
  onSwitchFarm,
  onGoToTop,
  onLayoutSave,
  onSaveSnapshot,
  onLoadSnapshot,
}) => {
  const { width, containerRef, mounted } = useContainerWidth();

  // ドラッグ直後に発生するクリックで詳細画面へ飛ばないようにする
  const lastDragEndRef = useRef(0);

  // ★過去データ一覧モーダルの開閉状態とリストデータ
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [snapshotsList, setSnapshotsList] = useState<Snapshot[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  const layout = buildLayout(plants.filter((p) => p.id));

  const handleDragStop = (
    newLayout: Layout,
    _oldItem: LayoutItem | null,
    _newItem: LayoutItem | null,
    _placeholder: LayoutItem | null,
    event: Event,
  ) => {
    lastDragEndRef.current = event.timeStamp;
    const positions: Record<string, GridPosition> = {};
    newLayout.forEach(({ i, x, y, w, h }) => {
      positions[i] = { x, y, w, h };
    });
    onLayoutSave(positions);
  };

  const handleResizeStop = (
    newLayout: Layout,
    _oldItem: LayoutItem | null,
    _newItem: LayoutItem | null,
    _placeholder: LayoutItem | null,
    event: Event,
  ) => {
    lastDragEndRef.current = event.timeStamp;
    const positions: Record<string, GridPosition> = {};
    newLayout.forEach(({ i, x, y, w, h }) => {
      positions[i] = { x, y, w, h };
    });
    onLayoutSave(positions);
  };

  const handleClick = (plant: Plant, event: React.MouseEvent) => {
    if (event.timeStamp - lastDragEndRef.current < 300) return;
    onSelectBox(plant);
  };

  // ★ 「過去のデータ」ボタンが押されたとき：一覧を取得してモーダルを開く
  const handleOpenSnapshotModal = async () => {
    try {
      setModalLoading(true);
      const data = await getSnapshots();

      // 現在のファームタイプ（spring / autumn）に一致するものだけ、あるいは全部表示するなどお好みで
      // ここでは全件取得してリスト化します
      setSnapshotsList(data);
      setIsModalOpen(true);
    } catch (err) {
      console.error("スナップショット一覧取得エラー:", err);
      alert("過去データの取得に失敗しました。");
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        padding: "15px",
        backgroundColor: farmType === "spring" ? "#eef7ee" : "#fdf3e7",
        minHeight: "100vh",
        boxSizing: "border-box",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        position: "relative",
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

        <div style={{ display: "flex", gap: "6px" }}>
          {/* ★ 保存ボタン */}
          {onSaveSnapshot && (
            <button
              onClick={onSaveSnapshot}
              style={{
                backgroundColor: "#4caf50",
                color: "#fff",
                border: "none",
                padding: "5px 10px",
                borderRadius: "4px",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              保存
            </button>
          )}

          {/* 過去のデータ一覧を開くボタン */}
          <button
            onClick={handleOpenSnapshotModal}
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #ccc",
              padding: "5px 10px",
              borderRadius: "4px",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            過去のデータ
          </button>
        </div>
      </div>

      {error && (
        <p style={{ color: "#d32f2f", fontSize: "13px", margin: "0 0 8px" }}>
          {error}
        </p>
      )}

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
        {loading && plants.length === 0 && (
          <p style={{ color: "#aaa", textAlign: "center" }}>読み込み中…</p>
        )}

        {!loading && plants.length === 0 && (
          <p style={{ color: "#aaa", textAlign: "center" }}>Boxがありません</p>
        )}

        {mounted && (
          <ReactGridLayout
            layout={layout}
            width={width}
            gridConfig={{
              cols: COLS,
              rowHeight: 80,
              margin: [10, 10],
            }}
            dragConfig={{
              enabled: !showArchived,
            }}
            resizeConfig={{
              // 過去データ閲覧時以外はリサイズを有効にする

              enabled: !showArchived,
            }}
            onDragStop={handleDragStop}
            onResizeStop={handleResizeStop} // ←リサイズ専用
          >
            {plants
              .filter((plant) => plant.id)
              .map((plant) => (
                <div
                  key={plant.id}
                  onClick={(e) => handleClick(plant, e)}
                  style={{
                    border: "1px solid #888",
                    borderRadius: "8px",
                    backgroundColor: "#fafafa",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: showArchived ? "default" : "pointer",
                    boxShadow: "1px 1px 3px rgba(0,0,0,0.1)",
                    userSelect: "none",
                    padding: "4px 8px",
                    boxSizing: "border-box",
                    overflow: "hidden",
                    // 🌟 スマホでのタップ反応を良くする
                    touchAction: "manipulation",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  {/* 🌟 どんな状態（空Box・データあり）でも、親の枠組みを常に同じ構造に統一します */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      maxWidth: "100%",
                      width: "100%",
                    }}
                  >
                    {plant.icon && (
                      <span style={{ fontSize: "18px" }}>{plant.icon}</span>
                    )}
                    <span
                      style={{
                        fontWeight: plant.name ? "bold" : "normal",
                        fontSize: plant.name ? "14px" : "13px",
                        // スマホの自動反転で白飛びしないよう、少しはっきりした色に変更
                        color: plant.name ? "#111827" : "#4b5563",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {plant.name || "空Box"}
                    </span>
                  </div>
                </div>
              ))}
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
        <button onClick={onGoToTop} style={footerButtonStyle}>
          終了
        </button>

        <button
          onClick={onAddBox}
          disabled={showArchived}
          style={{
            ...footerButtonStyle,
            cursor: showArchived ? "not-allowed" : "pointer",
            opacity: showArchived ? 0.5 : 1,
          }}
        >
          BOXを追加
        </button>

        <button
          onClick={() =>
            onSwitchFarm(farmType === "spring" ? "autumn" : "spring")
          }
          style={footerButtonStyle}
        >
          {farmType === "spring" ? "秋ファームへ" : "春ファームへ"}
        </button>
      </div>

      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "8px",
              width: "90%",
              maxWidth: "350px",
              maxHeight: "80vh",
              overflowY: "auto",
              boxSizing: "border-box",
            }}
          >
            <h3 style={{ marginTop: 0, fontSize: "1.1rem" }}>
              過去のファームデータ
            </h3>

            {modalLoading && <p>読み込み中...</p>}
            {!modalLoading && snapshotsList.length === 0 && (
              <p style={{ color: "#666", fontSize: "14px" }}>
                保存されたデータはありません。
              </p>
            )}

            {!modalLoading && snapshotsList.length > 0 && (
              <ul
                style={{ listStyle: "none", padding: 0, margin: "10px 0 20px" }}
              >
                {snapshotsList.map((snap) => (
                  <li key={snap.id} style={{ marginBottom: "8px" }}>
                    <button
                      onClick={() => {
                        if (onLoadSnapshot) {
                          onLoadSnapshot(snap.id, snap.title);
                        }

                        setIsModalOpen(false);
                      }}
                      style={{
                        width: "100%",
                        padding: "10px",
                        textAlign: "left",
                        backgroundColor: "#f5f5f5",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "13px",
                      }}
                    >
                      {snap.title}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                width: "100%",
                padding: "8px",
                backgroundColor: "#ccc",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
