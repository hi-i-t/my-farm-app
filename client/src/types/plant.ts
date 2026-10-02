export interface Plant {
  id?: string; // Boxを識別するID
  name: string; // 植物の名前（空Boxなら空文字 ''）
  type: "種" | "苗" | "球根"; // 種類
  icon?: string; // アイコン情報
  plantedDate?: string; // 植えた日
  harvestDate?: string; // 収穫予定日
  memo?: string; // メモ
  farmType: "spring" | "autumn"; // 春用か秋用か
  isArchived?: boolean; // 過去データ（アーカイブ）かどうか
  gridPosition: {
    // 画面上のグリッド位置（ここが重要！）
    x: number; // 横の位置（左から何マス目か）
    y: number; // 縦の位置（上から何マス目か）
    w: number; // 横幅（何マス分使うか）
    h: number; // 縦幅（何マス分使うか）
  };
}
