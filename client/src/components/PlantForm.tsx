import React, { useState } from "react";
import { Plant } from "../types/plant";

interface Props {
  selectedPlant: Plant;
  onSave: (plant: Plant) => void;
  onDelete: (id?: string) => void;
  onBack: () => void;
}

export const PlantForm: React.FC<Props> = ({
  selectedPlant,
  onSave,
  onDelete,
  onBack,
}) => {
  // 野菜・お花の選択肢（アイコンと名前のセット）
  const plantOptions = [
    { name: "選択してください。", icon: "" },
    // --- 野菜・根菜・葉物 ---
    { name: "にんじん", icon: "🥕" },
    { name: "ほうれん草", icon: "🥬" },
    { name: "玉ねぎ", icon: "🧅" },
    { name: "じゃがいも", icon: "🥔" },
    { name: "にんにく", icon: "🧄" },
    { name: "はくさい", icon: "🥬" },
    { name: "キャベツ", icon: "🥬" },
    { name: "春菊", icon: "🌿" },
    { name: "小松菜", icon: "🥬" },
    { name: "さつまいも", icon: "🍠" },
    { name: "ねぎ", icon: "🌱" },
    { name: "なす", icon: "🍆" },
    { name: "きゅうり", icon: "🥒" },
    { name: "トマト", icon: "🍅" },
    { name: "いちご", icon: "🍓" },
    { name: "里いも", icon: "🥔" },
    { name: "菊いも", icon: "🥔" },
    { name: "ピーマン", icon: "🫑" },
    { name: "ブロッコリー", icon: "🥦" },
    { name: "アスパラ", icon: "🌿" },
    { name: "カボチャ", icon: "🎃" },
    { name: "スイカ", icon: "🍉" },
    { name: "ウリ", icon: "🍈" },
    { name: "パプリカ", icon: "🫑" },
    { name: "ヤーコン", icon: "🍠" },
    { name: "しょうが", icon: "🫚" },
    { name: "とうがらし", icon: "🌶️" },
    { name: "エンドウ豆", icon: "🫘" },

    // --- お花 ---
    { name: "ダリア", icon: "🌸" },
    { name: "菊", icon: "🌼" },
    { name: "グラジオラス", icon: "🌾" },
    { name: "百日草", icon: "🌺" },
    { name: "ひまわり", icon: "🌻" },

    // --- その他 ---
    { name: "その他", icon: "⭐" },
  ];

  // もし初期値がリストにないカスタム名なら「その他」扱いにする
  const initialName = selectedPlant.name || "選択してください。";
  const isInitialCustom =
    initialName !== "選択してください。" &&
    !plantOptions.some((opt) => opt.name === initialName);

  // フォームで入力・選択された値を保持するステート
  const [name, setName] = useState<string>(
    isInitialCustom ? "その他" : initialName,
  );
  const [customName, setCustomName] = useState<string>(
    isInitialCustom ? initialName : "",
  );
  const [icon, setIcon] = useState<string>(selectedPlant.icon || "");
  const [type, setType] = useState(selectedPlant.type || "種");
  const [plantedDate, setPlantedDate] = useState(
    selectedPlant.plantedDate || "",
  );
  const [harvestDate, setHarvestDate] = useState(
    selectedPlant.harvestDate || "",
  );
  const [memo, setMemo] = useState(selectedPlant.memo || "");

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    if (selectedName === "その他") {
      setName("その他");
      setCustomName("");
      setIcon("⭐");
    } else {
      const found = plantOptions.find((opt) => opt.name === selectedName);
      if (found) {
        setName(found.name);
        setCustomName("");
        setIcon(found.icon);
      }
    }
  };

  // 「入力削除」ボタン
  const handleClearForm = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setName("選択してください。");
    setIcon("");
    setType("種");
    setPlantedDate("");
    setHarvestDate("");
    setMemo("");
  };

  // 「決定」ボタンを押したときの処理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 「その他」ならテキストボックスに入力した文字を使う
    const actualName = name === "その他" ? customName.trim() : name;
    const isCleared = actualName === "選択してください。" || actualName === "";

    // selectedPlant の持っている位置情報(gridPosition)やID、farmTypeを絶対に崩さず、中身だけを更新する
    const updatedPlant: Plant = {
      ...selectedPlant,
      name: isCleared ? "" : actualName, // ← 「その他」のときは入力した文字が保存されます
      type: isCleared ? "種" : type,
      icon: isCleared ? "" : name === "その他" ? "⭐" : icon,
      plantedDate: isCleared ? "" : plantedDate,
      harvestDate: isCleared ? "" : harvestDate,
      memo: isCleared ? "" : memo,
    };

    onSave(updatedPlant);
  };

  // もともと空だった（=初めから名前がなかった）場合は選択必須にするが、
  // もともと何かしらの名前が入っていたBoxなら、空（"選択してください。"）に戻して決定できるようにする
  const wasInitiallyEmpty =
    !selectedPlant.name || selectedPlant.name === "選択してください。";
  const isInvalid =
    wasInitiallyEmpty && (name === "選択してください。" || name === "");

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "20px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        backgroundColor: "#fff",
      }}
    >
      <h3 style={{ textAlign: "center", marginBottom: "20px" }}>
        野菜・お花情報設定
      </h3>

      <form onSubmit={handleSubmit}>
        {/* アイコン / 名称選択 */}
        {/* アイコン / 名称選択のブロック（既存） */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            アイコン / 名称選択:
          </label>
          <select
            value={name}
            onChange={handleSelectChange}
            style={{
              width: "100%",
              padding: "8px",
              backgroundColor: "#ffffff", // 白背景に固定
              color: "#000000", // 黒文字に固定
              WebkitTextFillColor: "#000000", // スマホでの白飛び防止
              border: "1px solid #ccc",
              borderRadius: "4px",
              boxSizing: "border-box",
            }}
          >
            {plantOptions.map((opt) => (
              <option
                key={opt.name}
                value={opt.name}
                style={{
                  backgroundColor: "#ffffff", // 選択肢の背景を白に固定
                  color: "#000000", // 選択肢の文字を黒に固定
                }}
              >
                {opt.icon ? `${opt.icon} ` : ""} {opt.name}
              </option>
            ))}
          </select>
        </div>

        {/* 「その他」が選ばれたときに出現する自由入力欄 */}
        {name === "その他" && (
          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                color: "#ca8a04",
                fontWeight: "bold",
              }}
            >
              名称を直接入力 (アイコン: ⭐):
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="名称を入力してください"
              style={{
                width: "100%",
                padding: "8px",
                backgroundColor: "#ffffff", // 白背景に固定
                color: "#000000", // 黒文字に固定
                WebkitTextFillColor: "#000000", // スマホでの白飛び防止
                border: "1px solid #ccc",
                borderRadius: "4px",
                boxSizing: "border-box",
              }}
            />
          </div>
        )}

        {/* タイプ (ラジオボタン) */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ color: "#000000", WebkitTextFillColor: "#000000" }}>タイプ :</label>
          <div style={{ display: "flex", gap: "15px", marginTop: "5px" }}>
            {["種", "苗", "球根"].map((t) => (
              <label key={t}
              style={{
              color: "#000000",                // 文字を黒に固定
                  WebkitTextFillColor: "#000000",  // スマホの白飛び防止
                  cursor: "pointer"
            }}
              >
                <input
                  type="radio"
                  name="plantType"
                  value={t}
                  checked={type === t}
                  onChange={(e) =>
                    setType(e.target.value as "種" | "苗" | "球根")
                  }
                  style={{
                    accentColor: "#52c41a", // 選択されたときのラジオボタンの色を緑に固定（黒潰れ防止）
                    width: "16px",
                    height: "16px",
                    cursor: "pointer",
                  }}
                />
                {t}
              </label>
            ))}
          </div>
        </div>

        {/* 植えた日 */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            植えた日:
          </label>
          <input
            type="date"
            value={plantedDate}
            onChange={(e) => setPlantedDate(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              backgroundColor: "#ffffff", // 白背景に固定
              color: "#000000", // 黒文字に固定
              WebkitTextFillColor: "#000000", // スマホでの白飛び防止
              border: "1px solid #ccc",
              borderRadius: "4px",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* 収穫日 */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            収穫日:
          </label>
          <input
            type="date"
            value={harvestDate}
            onChange={(e) => setHarvestDate(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              backgroundColor: "#ffffff", // 白背景に固定
              color: "#000000", // 黒文字に固定
              WebkitTextFillColor: "#000000", // スマホでの白飛び防止
              border: "1px solid #ccc",
              borderRadius: "4px",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* メモ */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            メモ :
          </label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={4}
            style={{
              width: "100%",
              padding: "8px",
              backgroundColor: "#ffffff", // 白背景に固定
              color: "#000000", // 黒文字に固定
              WebkitTextFillColor: "#000000", // スマホでの白飛び防止
              border: "1px solid #ccc",
              borderRadius: "4px",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* ボタンエリア */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={handleClearForm}
            style={{
              backgroundColor: "#faad14",
              color: "#fff",
              border: "none",
              padding: "8px 10px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            入力削除
          </button>

          <button
            type="button"
            onClick={() => onDelete(selectedPlant.id)}
            style={{
              backgroundColor: "#ff4d4f",
              color: "#fff",
              border: "none",
              padding: "8px 10px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Box削除
          </button>

          <button
            type="button"
            onClick={onBack}
            style={{
              backgroundColor: "#f0f0f0",
              border: "1px solid #ccc",
              padding: "8px 10px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            戻る
          </button>

          <button
            type="submit"
            disabled={isInvalid}
            style={{
              backgroundColor: isInvalid ? "#d9d9d9" : "#52c41a",
              color: "#fff",
              border: "none",
              padding: "8px 10px",
              borderRadius: "4px",
              cursor: isInvalid ? "not-allowed" : "pointer",
            }}
          >
            決定
          </button>
        </div>
      </form>
    </div>
  );
};
