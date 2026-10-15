import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TopPage } from "./pages/TopPage";
import { FarmPage } from "./pages/FarmPage";
import { PlantDetailPage } from "./pages/PlantDetailPage";

// ページ構成
//   /                                  トップ
//   /farm/:farmType                    メイン画面（spring / autumn）  ?archived=1 で過去データ
//   /farm/:farmType/plants/:id         詳細画面（IDからDBを読むのでリロードしてもOK）
export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/farm" element={<Navigate to="/farm/spring" replace />} />
        <Route path="/farm/:farmType" element={<FarmPage />} />
        <Route
          path="/farm/:farmType/plants/:id"
          element={<PlantDetailPage />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
