import { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { PlantCard } from "./components/PlantCard";
import { PlantForm } from "./components/PlantForm";
import {
  fetchPlants,
  createPlant,
  updatePlant,
  deletePlant,
} from "./services/api";
import { Plant } from "./types/plant";

export const App = () => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. 初回読み込み時にAPIからデータを取得
  const loadPlants = async () => {
    try {
      setLoading(true);
      const data = await fetchPlants();
      setPlants(data);
    } catch (error) {
      console.error("データの取得に失敗しました", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlants();
  }, []);

  const handleSelectBox = (plant: Plant) => {
    setSelectedPlant(plant);
    setIsFormOpen(true);
  };

  // 2. フォーム送信時（作成・更新）にAPIを呼び出す
  const handleFormSubmit = async (data: Omit<Plant, "id">) => {
    try {
      if (selectedPlant && selectedPlant.id) {
        // 更新 (PUT API)
        await updatePlant(selectedPlant.id, data);
      } else {
        // 新規追加 (POST API)
        await createPlant(data);
      }
      // 再取得して画面更新
      await loadPlants();
      setIsFormOpen(false);
      setSelectedPlant(null);
    } catch (error) {
      console.error("保存に失敗しました", error);
    }
  };

  // 3. 削除ボタン押下時にAPIを呼び出す
  const handleDelete = async () => {
    if (selectedPlant && selectedPlant.id) {
      try {
        // 削除 (DELETE API)
        await deletePlant(selectedPlant.id);
        // 再取得して画面更新
        await loadPlants();
        setIsFormOpen(false);
        setSelectedPlant(null);
      } catch (error) {
        console.error("削除に失敗しました", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="p-4 max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">マイファーム</h1>
          <button
            onClick={() => {
              setSelectedPlant(null);
              setIsFormOpen(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            + 新規追加
          </button>
        </div>

        {isFormOpen && (
          <PlantForm
            initialData={selectedPlant}
            onSubmit={handleFormSubmit}
            onDelete={selectedPlant ? handleDelete : undefined}
          />
        )}

        {loading ? (
          <div className="text-center py-8">読み込み中...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {plants.map((plant) => (
              <PlantCard
                key={plant.id}
                plant={plant}
                onClick={() => handleSelectBox(plant)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
