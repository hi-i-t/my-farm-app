import { useState } from "react";
import { Header } from "./components/Header";
import { PlantCard } from "./components/PlantCard";
import { PlantForm } from "./components/PlantForm";
import { mockPlants } from "./data/mockPlants";
import { Plant } from "./types/plant";

export const App = () => {
  const [plants, setPlants] = useState<Plant[]>(mockPlants);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSelectBox = (plant: Plant) => {
    setSelectedPlant(plant);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: Omit<Plant, "id">) => {
    if (selectedPlant) {
      setPlants(
        plants.map((p) =>
          p.id === selectedPlant.id ? { ...data, id: p.id } : p,
        ),
      );
    } else {
      const newPlant: Plant = {
        ...data,
        id: String(Date.now()),
      };
      setPlants([...plants, newPlant]);
    }
    setIsFormOpen(false);
    setSelectedPlant(null);
  };

  const handleDelete = () => {
    if (selectedPlant) {
      setPlants(plants.filter((p) => p.id !== selectedPlant.id));
      setIsFormOpen(false);
      setSelectedPlant(null);
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {plants.map((plant) => (
            <PlantCard
              key={plant.id}
              plant={plant}
              onClick={() => handleSelectBox(plant)}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default App;
