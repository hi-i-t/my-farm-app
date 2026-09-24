import React from "react";

export const Header: React.FC = () => {
  return (
    <header className="bg-green-700 text-white py-4 px-6 shadow-md mb-6 flex justify-between items-center">
      <div>
        <h1 className="text-xl font-bold tracking-wide">そだてこファーム</h1>
        <p className="text-xs text-green-100">畑のレイアウト管理アプリ</p>
      </div>
      {/* 将来的にボタンやユーザー情報を置くスペース */}
      <div className="text-sm">
        <span>マイページ</span>
      </div>
    </header>
  );
};
