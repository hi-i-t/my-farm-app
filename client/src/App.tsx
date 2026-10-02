import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TopPage } from "./pages/TopPage";
import { FarmPage } from "./pages/FarmPage";
import { PlantDetailPage } from "./pages/PlantDetailPage";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/farm" element={<FarmPage />} />
        <Route path="/detail" element={<PlantDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
