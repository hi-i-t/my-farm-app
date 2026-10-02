import React from "react";
import { useNavigate } from "react-router-dom";

export const TopPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        textAlign: "center",
        paddingTop: "100px",
        minHeight: "100vh",
        backgroundColor: "#fafafa",
      }}
    >
      <h1>そだてこファーム</h1>
      <p style={{ color: "#666" }}>畑のレイアウト管理アプリ</p>

      {/* 1枚目設計図の「そだてこファーム (トップ)」からの遷移 */}
      <div style={{ marginTop: "40px" }}>
        <button
          onClick={() => navigate("/farm")}
          style={{
            fontSize: "18px",
            padding: "14px 28px",
            borderRadius: "8px",
            backgroundColor: "#4caf50",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          メインページへ（スタート）
        </button>
      </div>
    </div>
  );
};
