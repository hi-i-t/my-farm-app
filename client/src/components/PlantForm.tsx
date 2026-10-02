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
  // フォームで入力・選択された値を保持するステート
  const [name, setName] = useState(selectedPlant.name || "選択してください。");
  const [icon, setIcon] = useState(selectedPlant.icon || "");
  const [type, setType] = useState(selectedPlant.type || "種");
  const [plantedDate, setPlantedDate] = useState(
    selectedPlant.plantedDate || "",
  );
  const [harvestDate, setHarvestDate] = useState(
    selectedPlant.harvestDate || "",
  );
  const [memo, setMemo] = useState(selectedPlant.memo || "");

  // 野菜・お花の選択肢（アイコンと名前のセット）
  const plantOptions = [
    { name: "選択してください。", icon: "" },
    { name: "にんじん", icon: "🥕" },
    { name: "トマト", icon: "🍅" },
    { name: "ナス", icon: "🍆" },
    { name: "ひまわり", icon: "🌻" },
  ];

  // セレクトボックスが変更されたときの処理
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    const found = plantOptions.find((opt) => opt.name === selectedName);
    if (found) {
      setName(found.name);
      setIcon(found.icon);
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

    // ★超重要：selectedPlant の持っている位置情報(gridPosition)やID、farmTypeを絶対に崩さず、中身だけを更新する
    const updatedPlant: Plant = {
      ...selectedPlant, // これにより、どのボックスをタップしたかの座標(gridPosition)が完全に維持されます
      name: name,
      type: type,
      icon: icon,
      plantedDate: plantedDate,
      harvestDate: harvestDate,
      memo: memo,
    };

    onSave(updatedPlant);
  };

  const isInvalid = name === "選択してください。" || name === "";

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
        &lt;DB&gt; 野菜・お花情報設定
      </h3>

      <form onSubmit={handleSubmit}>
        {/* アイコン / 名称選択 */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            アイコン / 名称選択:
          </label>
          <select
            value={name}
            onChange={handleSelectChange}
            style={{ width: "100%", padding: "8px" }}
          >
            {plantOptions.map((opt) => (
              <option key={opt.name} value={opt.name}>
                {opt.icon ? `${opt.icon} ` : ""} {opt.name}
              </option>
            ))}
          </select>
        </div>

        {/* タイプ (ラジオボタン) */}
        <div style={{ marginBottom: "15px" }}>
          <label>タイプ :</label>
          <div style={{ display: "flex", gap: "15px", marginTop: "5px" }}>
            {["種", "苗", "球根"].map((t) => (
              <label key={t}>
                <input
                  type="radio"
                  name="plantType"
                  value={t}
                  checked={type === t}
                  onChange={(e) =>
                    setType(e.target.value as "種" | "苗" | "球根")
                  }
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
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
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
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>

        {/* メモ */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            メモ (テキストボックス):
          </label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={4}
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
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
