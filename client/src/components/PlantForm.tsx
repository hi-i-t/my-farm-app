import React, { useState } from "react";
import { Plant } from "../types/plant";

interface PlantFormProps {
  initialData?: Plant | null;
  onSubmit: (data: Omit<Plant, "id">) => void;
  onDelete?: () => void;
}

export const PlantForm: React.FC<PlantFormProps> = ({
  initialData,
  onSubmit,
  onDelete,
}) => {
  const [name, setName] = useState(initialData?.name || "");
  const [type, setType] = useState(initialData?.type || "");
  const [plantedDate, setPlantedDate] = useState(
    initialData?.plantedDate || "",
  );
  const [harvestDate, setHarvestDate] = useState(
    initialData?.harvestDate || "",
  );
  const [memo, setMemo] = useState(initialData?.memo || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      type,
      plantedDate,
      harvestDate,
      memo,
      gridPosition: initialData?.gridPosition ?? 0,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-white rounded-lg shadow space-y-3"
    >
      <h2 className="text-lg font-bold mb-4">
        {initialData ? "植物の編集" : "新しい植物を追加"}
      </h2>

      <div>
        <label className="block text-sm font-medium">名前</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">種類</label>
        <input
          type="text"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      {/* ↓ ここで setPlantedDate を使用 */}
      <div>
        <label className="block text-sm font-medium">植えた日</label>
        <input
          type="date"
          value={plantedDate}
          onChange={(e) => setPlantedDate(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      {/* ↓ ここで setHarvestDate を使用 */}
      <div>
        <label className="block text-sm font-medium">収穫予定日</label>
        <input
          type="date"
          value={harvestDate}
          onChange={(e) => setHarvestDate(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      {/* ↓ ここで setMemo を使用 */}
      <div>
        <label className="block text-sm font-medium">メモ</label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          保存
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            削除
          </button>
        )}
      </div>
    </form>
  );
};
