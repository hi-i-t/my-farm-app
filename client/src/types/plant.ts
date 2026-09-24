export interface Plant {
  id?: string;
  name: string; // 例: 「にんじん」[cite: 8]
  type: string; // 種 / 苗 / 球根[cite: 8]
  plantedDate: string; // 植えた日[cite: 8]
  harvestDate: string; // 収穫日[cite: 8]
  memo: string; // メモ[cite: 8]
  gridPosition: number; // 畑のBox番号（1〜8）[cite: 5, 8]
}
