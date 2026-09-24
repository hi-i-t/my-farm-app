import React from "react";
import { Plant } from "../types/plant";

interface Props {
  plant: Plant;
  onClick: () => void;
}

export const PlantCard: React.FC<Props> = ({ plant, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="border p-4 rounded shadow cursor-pointer bg-white"
    >
      <h3 className="font-bold text-lg">{plant.name}</h3>
      <p className="text-sm">タイプ: {plant.type}</p>
      <p className="text-sm">植えた日: {plant.plantedDate}</p>
    </div>
  );
};
