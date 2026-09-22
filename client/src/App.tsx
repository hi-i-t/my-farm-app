import { useState, useEffect } from "react";
import RGL from "react-grid-layout";
import { supabase } from "./supabase";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

// RGLコンポーネント本体と WidthProvider を安全に取り出す
const ReactGridLayout = (RGL as any).default || RGL;
const WidthProvider =
  (RGL as any).WidthProvider || (ReactGridLayout as any).WidthProvider;

// WidthProviderが取得できていれば適用し、なければ通常のコンポーネントを使用
const GridWrapper =
  typeof WidthProvider === "function"
    ? WidthProvider(ReactGridLayout)
    : ReactGridLayout;

interface BoxData {
  id: number;
  icon: string;
  name: string;
  type: "種" | "苗" | "球根" | "";
}

interface SavedLayoutItem {
  id: string; // "1", "2"...
  x: number;
  y: number;
  w: number;
  h: number;
}
/**
 * 手書き見本通りの初期8個の配置 (2列 × 4行)
 * 上から順（行）: 7-8, 5-6, 3-4, 1-2
 */
const DEFAULT_LAYOUT: SavedLayoutItem[] = [
  { id: "7", x: 0, y: 0, w: 1, h: 1 },
  { id: "8", x: 1, y: 0, w: 1, h: 1 },
  { id: "5", x: 0, y: 1, w: 1, h: 1 },
  { id: "6", x: 1, y: 1, w: 1, h: 1 },
  { id: "3", x: 0, y: 2, w: 1, h: 1 },
  { id: "4", x: 1, y: 2, w: 1, h: 1 },
  { id: "1", x: 0, y: 3, w: 1, h: 1 },
  { id: "2", x: 1, y: 3, w: 1, h: 1 },
];
const ICON_OPTIONS = [
  { icon: "🥕", name: "にんじん" },
  { icon: "🍅", name: "トマト" },
  { icon: "🌽", name: "とうもろこし" },
  { icon: "🍆", name: "なす" },
  { icon: "🥬", name: "キャベツ" },
  { icon: "★", name: "その他" },
];

const createInitialBoxes = (): BoxData[] =>
  DEFAULT_LAYOUT.map((item) => ({
    id: parseInt(item.id, 10),
    icon: "",
    name: "",
    type: "",
  }));

export default function App() {
  const [currentPage, setCurrentPage] = useState<"top" | "spring" | "fall">(
    "top",
  );

  // 春ファームの状態
  const [springBoxes, setSpringBoxes] =
    useState<BoxData[]>(createInitialBoxes());
  const [springLayout, setSpringLayout] =
    useState<SavedLayoutItem[]>(DEFAULT_LAYOUT);

  // 秋ファームの状態
  const [fallBoxes, setFallBoxes] = useState<BoxData[]>(createInitialBoxes());
  const [fallLayout, setFallLayout] =
    useState<SavedLayoutItem[]>(DEFAULT_LAYOUT);

  const [selectedBox, setSelectedBox] = useState<{
    box: BoxData;
    season: "spring" | "fall";
  } | null>(null);

  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  // モーダル入力フォーム状態
  const [inputIcon, setInputIcon] = useState<string>("🥕");
  const [inputName, setInputName] = useState<string>("にんじん");
  const [customName, setCustomName] = useState<string>("");
  const [inputType, setInputType] = useState<"種" | "苗" | "球根">("種");

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchLayouts();
  }, []);

  // Supabaseから春・秋それぞれのデータを取得
  const fetchLayouts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("layouts").select("*");
    if (error) {
      console.error("データ取得エラー:", error);
    } else if (data) {
      const springData = data.find((item) => item.season === "spring");
      if (springData) {
        if (springData.boxes && springData.boxes.length > 0) {
          setSpringBoxes(springData.boxes);
        }
        if (springData.grid_layout && springData.grid_layout.length > 0) {
          setSpringLayout(springData.grid_layout);
        }
      }

      const fallData = data.find((item) => item.season === "fall");
      if (fallData) {
        if (fallData.boxes && fallData.boxes.length > 0) {
          setFallBoxes(fallData.boxes);
        }
        if (fallData.grid_layout && fallData.grid_layout.length > 0) {
          setFallLayout(fallData.grid_layout);
        }
      }
    }
    setLoading(false);
  };

  // Supabaseへ保存（季節ごとにレイアウトとBox情報をまるごと保存）
  const saveToSupabase = async (
    season: "spring" | "fall",
    boxesData: BoxData[],
    layoutData: SavedLayoutItem[],
  ) => {
    const { error } = await supabase
      .from("layouts")
      .upsert(
        { season: season, boxes: boxesData, grid_layout: layoutData },
        { onConflict: "season" },
      );

    if (error) {
      console.error("保存エラー:", error);
    }
  };

  // レイアウト変更時（移動・リサイズ）のハンドラー
  const handleLayoutChange = (
    currentLayout: any[],
    season: "spring" | "fall",
  ) => {
    const formattedLayout: SavedLayoutItem[] = currentLayout.map((item) => ({
      id: item.i,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
    }));

    if (season === "spring") {
      setSpringLayout(formattedLayout);
      saveToSupabase("spring", springBoxes, formattedLayout);
    } else {
      setFallLayout(formattedLayout);
      saveToSupabase("fall", fallBoxes, formattedLayout);
    }
  };

  // BOX追加処理
  const handleAddBox = async (season: "spring" | "fall") => {
    const currentBoxes = season === "spring" ? springBoxes : fallBoxes;
    const currentLayout = season === "spring" ? springLayout : fallLayout;

    const maxId = currentBoxes.reduce((max, b) => (b.id > max ? b.id : max), 0);
    const newId = maxId + 1;

    const newBox: BoxData = { id: newId, icon: "", name: "", type: "" };
    const updatedBoxes = [...currentBoxes, newBox];

    const newLayoutItem: SavedLayoutItem = {
      id: String(newId),
      x: 0,
      y: Infinity, // 空いている一番下に自動配置
      w: 1,
      h: 1,
    };
    const updatedLayout = [...currentLayout, newLayoutItem];

    if (season === "spring") {
      setSpringBoxes(updatedBoxes);
      setSpringLayout(updatedLayout);
      await saveToSupabase("spring", updatedBoxes, updatedLayout);
    } else {
      setFallBoxes(updatedBoxes);
      setFallLayout(updatedLayout);
      await saveToSupabase("fall", updatedBoxes, updatedLayout);
    }
  };

  const handleOpenModal = (box: BoxData, season: "spring" | "fall") => {
    setSelectedBox({ box, season });

    const isPreset = ICON_OPTIONS.some((o) => o.name === box.name);
    if (isPreset) {
      setInputIcon(box.icon || "🥕");
      setInputName(box.name || "にんじん");
      setCustomName("");
    } else if (box.name) {
      setInputIcon(box.icon || "★");
      setInputName("その他");
      setCustomName(box.name);
    } else {
      setInputIcon("🥕");
      setInputName("にんじん");
      setCustomName("");
    }
    setInputType(box.type || "種");
  };

  const handleSelectCrop = (selectedOptionName: string) => {
    setInputName(selectedOptionName);
    const found = ICON_OPTIONS.find((o) => o.name === selectedOptionName);
    if (found) {
      setInputIcon(found.icon);
    }
  };

  const handleSaveBox = async () => {
    if (!selectedBox) return;

    const finalName = inputName === "その他" ? customName : inputName;
    const updatedBox: BoxData = {
      id: selectedBox.box.id,
      icon: inputIcon,
      name: finalName,
      type: inputType,
    };

    if (selectedBox.season === "spring") {
      const newBoxes = springBoxes.map((b) =>
        b.id === selectedBox.box.id ? updatedBox : b,
      );
      setSpringBoxes(newBoxes);
      await saveToSupabase("spring", newBoxes, springLayout);
    } else {
      const newBoxes = fallBoxes.map((b) =>
        b.id === selectedBox.box.id ? updatedBox : b,
      );
      setFallBoxes(newBoxes);
      await saveToSupabase("fall", newBoxes, fallLayout);
    }

    setSelectedBox(null);
  };

  const handleClearBox = async () => {
    if (!selectedBox) return;

    const clearedBox: BoxData = {
      id: selectedBox.box.id,
      icon: "",
      name: "",
      type: "",
    };

    if (selectedBox.season === "spring") {
      const newBoxes = springBoxes.map((b) =>
        b.id === selectedBox.box.id ? clearedBox : b,
      );
      setSpringBoxes(newBoxes);
      await saveToSupabase("spring", newBoxes, springLayout);
    } else {
      const newBoxes = fallBoxes.map((b) =>
        b.id === selectedBox.box.id ? clearedBox : b,
      );
      setFallBoxes(newBoxes);
      await saveToSupabase("fall", newBoxes, fallLayout);
    }

    setSelectedBox(null);
  };

  const handleDeleteBox = async () => {
    if (!selectedBox) return;

    const targetId = selectedBox.box.id;
    const season = selectedBox.season;

    if (season === "spring") {
      const updatedBoxes = springBoxes.filter((b) => b.id !== targetId);
      const updatedLayout = springLayout.filter(
        (l) => l.id !== String(targetId),
      );
      setSpringBoxes(updatedBoxes);
      setSpringLayout(updatedLayout);
      await saveToSupabase("spring", updatedBoxes, updatedLayout);
    } else {
      const updatedBoxes = fallBoxes.filter((b) => b.id !== targetId);
      const updatedLayout = fallLayout.filter((l) => l.id !== String(targetId));
      setFallBoxes(updatedBoxes);
      setFallLayout(updatedLayout);
      await saveToSupabase("fall", updatedBoxes, updatedLayout);
    }

    setSelectedBox(null);
  };

  // react-grid-layoutのレンダリング
  const renderGrid = (
    boxes: BoxData[],
    layout: SavedLayoutItem[],
    season: "spring" | "fall",
  ) => {
    const rglLayout: any[] = layout.map((item) => ({
      i: item.id,
      x: item.x,
      y: item.y,
      w: 1,
      h: 1,
      minW: 1,
      minH: 1,
    }));

    return (
      <GridWrapper
        className="layout"
        layout={rglLayout}
        cols={2} // 2列のグリッド
        rowHeight={100}
        margin={[10, 10]}
        isDraggable={true}
        isResizable={false} // サイズ変更（ドラッグで拡大縮小）を許可
        compactType={null} //勝手に上に詰まらないように設定
        preventCollision={false} //移動時に自動で位置を入替
        onLayoutChange={(newLayout: any) =>
          handleLayoutChange(newLayout, season)
        }
      >
        {layout.map((item: any) => {
          const box = boxes.find((b) => String(b.id) === item.i);

          // 対象のボックスデータを準備（なければ初期データ）
          const targetBox: BoxData = box || {
            id: parseInt(item.i, 10),
            icon: "",
            name: "",
            type: "",
          };
          return (
            <div
              key={item.id}
              /* ★ 1. onClick を追加して handleOpenModal を呼び出す */
              onClick={() => handleOpenModal(targetBox, season)}
              style={{
                border: "1px dashed #ccc",
                borderRadius: "8px",
                padding: "8px",
                background: "#fff",
                cursor: "pointer", // ★ 2. タップできることがわかりやすいように pointer に変更
                userSelect: "none",
              }}
            >
              <div style={{ fontSize: "12px", color: "#888" }}>{item.id}</div>
              {box ? (
                <div style={{ textAlign: "center" }}>
                  <div>{box.icon}</div>
                  <div>{box.name}</div>
                </div>
              ) : (
                <div
                  style={{
                    color: "#aaa",
                    textAlign: "center",
                    marginTop: "10px",
                  }}
                >
                  タップして入力
                </div>
              )}
            </div>
          );
        })}
      </GridWrapper>
    );
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "10px auto",
        padding: "12px",
        fontFamily: "sans-serif",
        boxSizing: "border-box",
      }}
    >
      {loading && <p style={{ textAlign: "center" }}>読み込み中...</p>}

      {/* 1. トップページ */}
      {!loading && currentPage === "top" && (
        <div
          style={{
            border: "2px solid #333",
            borderRadius: "12px",
            padding: "24px 16px",
            textAlign: "center",
            backgroundColor: "#fff",
            minHeight: "420px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <h2 style={{ fontSize: "22px", margin: "10px 0" }}>
            そだてこファーム
          </h2>
          <div style={{ fontSize: "60px", margin: "20px 0" }}>🌸🌻🍁</div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              gap: "12px",
            }}
          >
            <button
              onClick={() =>
                alert("アプリを終了するにはブラウザのタブを閉じてください。")
              }
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                backgroundColor: "#f5f5f5",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              終了
            </button>
            <button
              onClick={() => setCurrentPage("spring")}
              style={{
                padding: "10px 24px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#4CAF50",
                color: "#fff",
                fontWeight: "bold",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              スタート ➔
            </button>
          </div>
        </div>
      )}

      {/* 2. メインページ (春 / 秋) */}
      {!loading && currentPage !== "top" && (
        <div
          style={{
            border: "2px solid #333",
            borderRadius: "12px",
            padding: "14px",
            backgroundColor: "#fff",
            position: "relative",
          }}
        >
          {/* ヘッダー */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "18px" }}>
              {currentPage === "spring" ? "🌱 春ファーム" : "🍁 秋ファーム"}
            </h2>
            <button
              onClick={() => setShowHistoryModal(true)}
              style={{
                padding: "5px 10px",
                borderRadius: "6px",
                border: "1px solid #2196F3",
                backgroundColor: "#e3f2fd",
                color: "#1976D2",
                fontWeight: "bold",
                fontSize: "11px",
                cursor: "pointer",
              }}
            >
              過去のデータ
            </button>
          </div>

          {/* グリッド表示 (react-grid-layout) */}
          <div style={{ minHeight: "380px" }}>
            {currentPage === "spring" &&
              renderGrid(springBoxes, springLayout, "spring")}
            {currentPage === "fall" &&
              renderGrid(fallBoxes, fallLayout, "fall")}
          </div>

          {/* アクションボタンバー */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "6px",
              marginTop: "12px",
              paddingTop: "12px",
              borderTop: "1px solid #eee",
            }}
          >
            <button
              onClick={() => setCurrentPage("top")}
              style={{
                flex: 1,
                padding: "8px 2px",
                borderRadius: "8px",
                border: "1px solid #999",
                backgroundColor: "#f5f5f5",
                fontWeight: "bold",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              終了
            </button>

            <button
              onClick={() => handleAddBox(currentPage)}
              style={{
                flex: 1.4,
                padding: "8px 2px",
                borderRadius: "8px",
                border: "1px solid #4CAF50",
                backgroundColor: "#e8f5e9",
                color: "#2e7d32",
                fontWeight: "bold",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              ＋ Boxを追加
            </button>

            {currentPage === "spring" ? (
              <button
                onClick={() => setCurrentPage("fall")}
                style={{
                  flex: 1.4,
                  padding: "8px 2px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#FF9800",
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                秋ファームへ ➔
              </button>
            ) : (
              <button
                onClick={() => setCurrentPage("spring")}
                style={{
                  flex: 1.4,
                  padding: "8px 2px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#4CAF50",
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                🌱 春ファームへ
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. BOX設定モーダル */}
      {selectedBox && (
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
              borderRadius: "12px",
              width: "280px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                borderBottom: "1px solid #eee",
                paddingBottom: "8px",
                fontSize: "16px",
              }}
            >
              Box {selectedBox.box.id} の設定（
              {selectedBox.season === "spring" ? "春" : "秋"}）
            </h3>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "bold",
                  fontSize: "13px",
                }}
              >
                アイコン・作物:
              </label>
              <select
                value={inputName}
                onChange={(e) => handleSelectCrop(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
              >
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt.name} value={opt.name}>
                    {opt.icon} {opt.name}
                  </option>
                ))}
              </select>

              {inputName === "その他" && (
                <input
                  type="text"
                  placeholder="作物名を入力"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  style={{
                    width: "100%",
                    marginTop: "8px",
                    padding: "8px",
                    boxSizing: "border-box",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                  }}
                />
              )}
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "bold",
                  fontSize: "13px",
                }}
              >
                タイプ:
              </label>
              <div style={{ display: "flex", gap: "12px", fontSize: "13px" }}>
                {(["種", "苗", "球根"] as const).map((t) => (
                  <label key={t} style={{ cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="cropType"
                      value={t}
                      checked={inputType === t}
                      onChange={() => setInputType(t)}
                    />
                    {t}
                  </label>
                ))}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "6px",
                marginTop: "20px",
              }}
            >
              <div style={{ display: "flex", gap: "4px" }}>
                <button
                  onClick={handleClearBox}
                  style={{
                    padding: "6px 8px",
                    borderRadius: "6px",
                    border: "1px solid #ffa39e",
                    background: "#fff1f0",
                    color: "#d9363e",
                    fontSize: "11px",
                    cursor: "pointer",
                  }}
                >
                  クリア
                </button>
                <button
                  onClick={handleDeleteBox}
                  style={{
                    padding: "6px 8px",
                    borderRadius: "6px",
                    border: "none",
                    background: "#ff4d4f",
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: "11px",
                    cursor: "pointer",
                  }}
                >
                  削除
                </button>
              </div>

              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  onClick={() => setSelectedBox(null)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    background: "#f5f5f5",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  取消
                </button>
                <button
                  onClick={handleSaveBox}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "none",
                    background: "#4CAF50",
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  決定
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. 過去データ表示モーダル */}
      {showHistoryModal && (
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
              borderRadius: "12px",
              width: "300px",
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                borderBottom: "1px solid #eee",
                paddingBottom: "8px",
                fontSize: "16px",
              }}
            >
              📜 過去のデータ保存
            </h3>

            <div style={{ marginBottom: "16px" }}>
              <h4 style={{ margin: "8px 0", color: "#2e7d32" }}>
                🌱 春ファーム
              </h4>
              {springBoxes.filter((b) => b.name).length === 0 ? (
                <p style={{ color: "#888", fontSize: "12px" }}>
                  登録データなし
                </p>
              ) : (
                <ul
                  style={{ paddingLeft: "20px", fontSize: "13px", margin: 0 }}
                >
                  {springBoxes
                    .filter((b) => b.name)
                    .map((b) => (
                      <li key={b.id}>
                        Box {b.id}: {b.icon} {b.name}（{b.type}）
                      </li>
                    ))}
                </ul>
              )}
            </div>

            <div style={{ marginBottom: "20px" }}>
              <h4 style={{ margin: "8px 0", color: "#e65100" }}>
                🍁 秋ファーム
              </h4>
              {fallBoxes.filter((b) => b.name).length === 0 ? (
                <p style={{ color: "#888", fontSize: "12px" }}>
                  登録データなし
                </p>
              ) : (
                <ul
                  style={{ paddingLeft: "20px", fontSize: "13px", margin: 0 }}
                >
                  {fallBoxes
                    .filter((b) => b.name)
                    .map((b) => (
                      <li key={b.id}>
                        Box {b.id}: {b.icon} {b.name}（{b.type}）
                      </li>
                    ))}
                </ul>
              )}
            </div>

            <button
              onClick={() => setShowHistoryModal(false)}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: "#2196F3",
                color: "#fff",
                fontWeight: "bold",
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
