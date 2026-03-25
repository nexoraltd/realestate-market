export interface CityGeo {
  code: string;     // 市区町村コード（5桁）
  name: string;
  prefCode: string; // 都道府県コード（2桁）
  lat: number;
  lng: number;
}

export const MAJOR_CITIES: CityGeo[] = [
  // ── 北海道 ──
  { code: "01100", name: "札幌市",   prefCode: "01", lat: 43.06, lng: 141.35 },
  { code: "01202", name: "函館市",   prefCode: "01", lat: 41.77, lng: 140.73 },
  { code: "01204", name: "旭川市",   prefCode: "01", lat: 43.77, lng: 142.37 },
  { code: "01206", name: "釧路市",   prefCode: "01", lat: 42.98, lng: 144.38 },
  { code: "01207", name: "帯広市",   prefCode: "01", lat: 42.92, lng: 143.20 },
  { code: "01203", name: "小樽市",   prefCode: "01", lat: 43.19, lng: 140.99 },
  { code: "01208", name: "北見市",   prefCode: "01", lat: 43.80, lng: 143.90 },
  { code: "01215", name: "苫小牧市", prefCode: "01", lat: 42.63, lng: 141.61 },
  // ── 青森 ──
  { code: "02201", name: "青森市",   prefCode: "02", lat: 40.82, lng: 140.74 },
  { code: "02202", name: "弘前市",   prefCode: "02", lat: 40.60, lng: 140.47 },
  { code: "02203", name: "八戸市",   prefCode: "02", lat: 40.51, lng: 141.49 },
  // ── 岩手 ──
  { code: "03201", name: "盛岡市",   prefCode: "03", lat: 39.70, lng: 141.15 },
  { code: "03202", name: "宮古市",   prefCode: "03", lat: 39.64, lng: 141.95 },
  { code: "03205", name: "一関市",   prefCode: "03", lat: 38.93, lng: 141.13 },
  // ── 宮城 ──
  { code: "04100", name: "仙台市",   prefCode: "04", lat: 38.27, lng: 140.87 },
  { code: "04202", name: "石巻市",   prefCode: "04", lat: 38.43, lng: 141.30 },
  { code: "04204", name: "塩竈市",   prefCode: "04", lat: 38.31, lng: 141.02 },
  // ── 秋田 ──
  { code: "05201", name: "秋田市",   prefCode: "05", lat: 39.72, lng: 140.10 },
  { code: "05202", name: "能代市",   prefCode: "05", lat: 40.21, lng: 140.03 },
  // ── 山形 ──
  { code: "06201", name: "山形市",   prefCode: "06", lat: 38.24, lng: 140.34 },
  { code: "06202", name: "米沢市",   prefCode: "06", lat: 37.92, lng: 140.12 },
  { code: "06204", name: "酒田市",   prefCode: "06", lat: 38.91, lng: 139.84 },
  // ── 福島 ──
  { code: "07201", name: "福島市",   prefCode: "07", lat: 37.75, lng: 140.47 },
  { code: "07203", name: "郡山市",   prefCode: "07", lat: 37.39, lng: 140.39 },
  { code: "07204", name: "いわき市", prefCode: "07", lat: 37.05, lng: 140.89 },
  { code: "07205", name: "白河市",   prefCode: "07", lat: 37.13, lng: 140.19 },
  { code: "07208", name: "会津若松市", prefCode: "07", lat: 37.49, lng: 139.93 },
  // ── 茨城 ──
  { code: "08201", name: "水戸市",   prefCode: "08", lat: 36.34, lng: 140.45 },
  { code: "08202", name: "日立市",   prefCode: "08", lat: 36.60, lng: 140.65 },
  { code: "08220", name: "つくば市", prefCode: "08", lat: 36.08, lng: 140.08 },
  { code: "08205", name: "土浦市",   prefCode: "08", lat: 36.07, lng: 140.20 },
  // ── 栃木 ──
  { code: "09201", name: "宇都宮市", prefCode: "09", lat: 36.57, lng: 139.88 },
  { code: "09204", name: "足利市",   prefCode: "09", lat: 36.34, lng: 139.45 },
  { code: "09208", name: "小山市",   prefCode: "09", lat: 36.32, lng: 139.80 },
  // ── 群馬 ──
  { code: "10201", name: "前橋市",   prefCode: "10", lat: 36.39, lng: 139.06 },
  { code: "10202", name: "高崎市",   prefCode: "10", lat: 36.32, lng: 139.00 },
  { code: "10203", name: "桐生市",   prefCode: "10", lat: 36.41, lng: 139.33 },
  { code: "10208", name: "太田市",   prefCode: "10", lat: 36.29, lng: 139.38 },
  // ── 埼玉 ──
  { code: "11100", name: "さいたま市", prefCode: "11", lat: 35.86, lng: 139.65 },
  { code: "11201", name: "川越市",   prefCode: "11", lat: 35.93, lng: 139.49 },
  { code: "11203", name: "川口市",   prefCode: "11", lat: 35.81, lng: 139.72 },
  { code: "11204", name: "行田市",   prefCode: "11", lat: 36.14, lng: 139.46 },
  { code: "11210", name: "所沢市",   prefCode: "11", lat: 35.80, lng: 139.47 },
  { code: "11215", name: "草加市",   prefCode: "11", lat: 35.83, lng: 139.81 },
  { code: "11222", name: "越谷市",   prefCode: "11", lat: 35.89, lng: 139.79 },
  // ── 千葉 ──
  { code: "12100", name: "千葉市",   prefCode: "12", lat: 35.61, lng: 140.12 },
  { code: "12203", name: "市川市",   prefCode: "12", lat: 35.72, lng: 139.92 },
  { code: "12204", name: "船橋市",   prefCode: "12", lat: 35.69, lng: 140.02 },
  { code: "12207", name: "松戸市",   prefCode: "12", lat: 35.79, lng: 139.90 },
  { code: "12208", name: "野田市",   prefCode: "12", lat: 35.95, lng: 139.87 },
  { code: "12210", name: "柏市",     prefCode: "12", lat: 35.87, lng: 139.98 },
  { code: "12219", name: "市原市",   prefCode: "12", lat: 35.50, lng: 140.12 },
  { code: "12220", name: "流山市",   prefCode: "12", lat: 35.86, lng: 139.90 },
  // ── 東京 ──
  { code: "13101", name: "千代田区", prefCode: "13", lat: 35.69, lng: 139.75 },
  { code: "13102", name: "中央区",   prefCode: "13", lat: 35.67, lng: 139.77 },
  { code: "13103", name: "港区",     prefCode: "13", lat: 35.66, lng: 139.75 },
  { code: "13104", name: "新宿区",   prefCode: "13", lat: 35.69, lng: 139.70 },
  { code: "13107", name: "墨田区",   prefCode: "13", lat: 35.71, lng: 139.81 },
  { code: "13109", name: "品川区",   prefCode: "13", lat: 35.61, lng: 139.73 },
  { code: "13111", name: "大田区",   prefCode: "13", lat: 35.57, lng: 139.72 },
  { code: "13112", name: "世田谷区", prefCode: "13", lat: 35.65, lng: 139.65 },
  { code: "13113", name: "渋谷区",   prefCode: "13", lat: 35.66, lng: 139.70 },
  { code: "13114", name: "中野区",   prefCode: "13", lat: 35.71, lng: 139.66 },
  { code: "13118", name: "荒川区",   prefCode: "13", lat: 35.74, lng: 139.78 },
  { code: "13123", name: "江戸川区", prefCode: "13", lat: 35.71, lng: 139.87 },
  { code: "13201", name: "八王子市", prefCode: "13", lat: 35.67, lng: 139.32 },
  { code: "13202", name: "立川市",   prefCode: "13", lat: 35.70, lng: 139.41 },
  { code: "13204", name: "三鷹市",   prefCode: "13", lat: 35.68, lng: 139.56 },
  { code: "13208", name: "町田市",   prefCode: "13", lat: 35.54, lng: 139.45 },
  // ── 神奈川 ──
  { code: "14100", name: "横浜市",   prefCode: "14", lat: 35.45, lng: 139.64 },
  { code: "14130", name: "川崎市",   prefCode: "14", lat: 35.52, lng: 139.70 },
  { code: "14150", name: "相模原市", prefCode: "14", lat: 35.57, lng: 139.37 },
  { code: "14201", name: "横須賀市", prefCode: "14", lat: 35.28, lng: 139.67 },
  { code: "14203", name: "平塚市",   prefCode: "14", lat: 35.33, lng: 139.35 },
  { code: "14204", name: "鎌倉市",   prefCode: "14", lat: 35.32, lng: 139.55 },
  { code: "14205", name: "藤沢市",   prefCode: "14", lat: 35.34, lng: 139.49 },
  { code: "14210", name: "小田原市", prefCode: "14", lat: 35.26, lng: 139.15 },
  { code: "14211", name: "茅ヶ崎市", prefCode: "14", lat: 35.33, lng: 139.42 },
  { code: "14213", name: "厚木市",   prefCode: "14", lat: 35.44, lng: 139.36 },
  { code: "14214", name: "大和市",   prefCode: "14", lat: 35.49, lng: 139.46 },
  // ── 新潟 ──
  { code: "15100", name: "新潟市",   prefCode: "15", lat: 37.90, lng: 139.02 },
  { code: "15202", name: "長岡市",   prefCode: "15", lat: 37.45, lng: 138.85 },
  { code: "15204", name: "三条市",   prefCode: "15", lat: 37.64, lng: 138.96 },
  { code: "15208", name: "上越市",   prefCode: "15", lat: 37.15, lng: 138.24 },
  // ── 富山 ──
  { code: "16201", name: "富山市",   prefCode: "16", lat: 36.70, lng: 137.21 },
  { code: "16202", name: "高岡市",   prefCode: "16", lat: 36.75, lng: 137.03 },
  // ── 石川 ──
  { code: "17201", name: "金沢市",   prefCode: "17", lat: 36.59, lng: 136.63 },
  { code: "17202", name: "七尾市",   prefCode: "17", lat: 37.05, lng: 136.97 },
  { code: "17206", name: "小松市",   prefCode: "17", lat: 36.41, lng: 136.45 },
  // ── 福井 ──
  { code: "18201", name: "福井市",   prefCode: "18", lat: 36.07, lng: 136.22 },
  { code: "18202", name: "敦賀市",   prefCode: "18", lat: 35.65, lng: 136.06 },
  // ── 山梨 ──
  { code: "19201", name: "甲府市",   prefCode: "19", lat: 35.66, lng: 138.57 },
  { code: "19204", name: "富士吉田市", prefCode: "19", lat: 35.49, lng: 138.81 },
  // ── 長野 ──
  { code: "20201", name: "長野市",   prefCode: "20", lat: 36.65, lng: 138.18 },
  { code: "20202", name: "松本市",   prefCode: "20", lat: 36.23, lng: 137.97 },
  { code: "20204", name: "岡谷市",   prefCode: "20", lat: 36.06, lng: 138.05 },
  { code: "20206", name: "飯田市",   prefCode: "20", lat: 35.52, lng: 137.82 },
  { code: "20215", name: "上田市",   prefCode: "20", lat: 36.40, lng: 138.25 },
  { code: "20216", name: "諏訪市",   prefCode: "20", lat: 36.04, lng: 138.07 },
  // ── 岐阜 ──
  { code: "21201", name: "岐阜市",   prefCode: "21", lat: 35.42, lng: 136.76 },
  { code: "21202", name: "大垣市",   prefCode: "21", lat: 35.36, lng: 136.62 },
  { code: "21204", name: "高山市",   prefCode: "21", lat: 36.15, lng: 137.25 },
  { code: "21206", name: "各務原市", prefCode: "21", lat: 35.40, lng: 136.85 },
  // ── 静岡 ──
  { code: "22100", name: "静岡市",   prefCode: "22", lat: 34.98, lng: 138.38 },
  { code: "22130", name: "浜松市",   prefCode: "22", lat: 34.71, lng: 137.73 },
  { code: "22203", name: "沼津市",   prefCode: "22", lat: 35.10, lng: 138.86 },
  { code: "22210", name: "富士市",   prefCode: "22", lat: 35.17, lng: 138.68 },
  { code: "22213", name: "焼津市",   prefCode: "22", lat: 34.87, lng: 138.32 },
  { code: "22214", name: "掛川市",   prefCode: "22", lat: 34.76, lng: 138.01 },
  // ── 愛知 ──
  { code: "23100", name: "名古屋市", prefCode: "23", lat: 35.18, lng: 136.91 },
  { code: "23201", name: "豊橋市",   prefCode: "23", lat: 34.77, lng: 137.39 },
  { code: "23202", name: "岡崎市",   prefCode: "23", lat: 34.95, lng: 137.17 },
  { code: "23203", name: "一宮市",   prefCode: "23", lat: 35.30, lng: 136.80 },
  { code: "23205", name: "半田市",   prefCode: "23", lat: 34.89, lng: 136.94 },
  { code: "23206", name: "春日井市", prefCode: "23", lat: 35.25, lng: 137.00 },
  { code: "23211", name: "豊田市",   prefCode: "23", lat: 35.08, lng: 137.16 },
  { code: "23216", name: "刈谷市",   prefCode: "23", lat: 34.99, lng: 137.00 },
  // ── 三重 ──
  { code: "24201", name: "津市",     prefCode: "24", lat: 34.73, lng: 136.51 },
  { code: "24202", name: "四日市市", prefCode: "24", lat: 34.97, lng: 136.62 },
  { code: "24204", name: "伊勢市",   prefCode: "24", lat: 34.49, lng: 136.71 },
  { code: "24205", name: "松阪市",   prefCode: "24", lat: 34.58, lng: 136.53 },
  // ── 滋賀 ──
  { code: "25201", name: "大津市",   prefCode: "25", lat: 35.00, lng: 135.87 },
  { code: "25202", name: "彦根市",   prefCode: "25", lat: 35.27, lng: 136.25 },
  { code: "25208", name: "草津市",   prefCode: "25", lat: 35.02, lng: 135.96 },
  // ── 京都 ──
  { code: "26100", name: "京都市",   prefCode: "26", lat: 35.02, lng: 135.76 },
  { code: "26201", name: "福知山市", prefCode: "26", lat: 35.30, lng: 135.12 },
  { code: "26208", name: "宇治市",   prefCode: "26", lat: 34.89, lng: 135.80 },
  // ── 大阪 ──
  { code: "27100", name: "大阪市",   prefCode: "27", lat: 34.69, lng: 135.50 },
  { code: "27140", name: "堺市",     prefCode: "27", lat: 34.57, lng: 135.48 },
  { code: "27202", name: "豊中市",   prefCode: "27", lat: 34.78, lng: 135.47 },
  { code: "27204", name: "吹田市",   prefCode: "27", lat: 34.76, lng: 135.52 },
  { code: "27207", name: "高槻市",   prefCode: "27", lat: 34.85, lng: 135.62 },
  { code: "27211", name: "守口市",   prefCode: "27", lat: 34.73, lng: 135.56 },
  { code: "27212", name: "枚方市",   prefCode: "27", lat: 34.81, lng: 135.65 },
  { code: "27214", name: "茨木市",   prefCode: "27", lat: 34.82, lng: 135.57 },
  { code: "27215", name: "八尾市",   prefCode: "27", lat: 34.63, lng: 135.60 },
  { code: "27222", name: "東大阪市", prefCode: "27", lat: 34.68, lng: 135.60 },
  // ── 兵庫 ──
  { code: "28100", name: "神戸市",   prefCode: "28", lat: 34.69, lng: 135.19 },
  { code: "28201", name: "姫路市",   prefCode: "28", lat: 34.82, lng: 134.69 },
  { code: "28202", name: "尼崎市",   prefCode: "28", lat: 34.73, lng: 135.41 },
  { code: "28204", name: "明石市",   prefCode: "28", lat: 34.65, lng: 135.01 },
  { code: "28210", name: "西宮市",   prefCode: "28", lat: 34.74, lng: 135.34 },
  { code: "28214", name: "芦屋市",   prefCode: "28", lat: 34.73, lng: 135.30 },
  { code: "28215", name: "伊丹市",   prefCode: "28", lat: 34.78, lng: 135.40 },
  { code: "28218", name: "宝塚市",   prefCode: "28", lat: 34.80, lng: 135.36 },
  // ── 奈良 ──
  { code: "29201", name: "奈良市",   prefCode: "29", lat: 34.68, lng: 135.83 },
  { code: "29202", name: "大和高田市", prefCode: "29", lat: 34.52, lng: 135.74 },
  { code: "29207", name: "橿原市",   prefCode: "29", lat: 34.51, lng: 135.79 },
  // ── 和歌山 ──
  { code: "30201", name: "和歌山市", prefCode: "30", lat: 34.23, lng: 135.17 },
  { code: "30204", name: "田辺市",   prefCode: "30", lat: 33.73, lng: 135.38 },
  // ── 鳥取 ──
  { code: "31201", name: "鳥取市",   prefCode: "31", lat: 35.50, lng: 134.24 },
  { code: "31202", name: "米子市",   prefCode: "31", lat: 35.43, lng: 133.33 },
  // ── 島根 ──
  { code: "32201", name: "松江市",   prefCode: "32", lat: 35.47, lng: 133.05 },
  { code: "32203", name: "出雲市",   prefCode: "32", lat: 35.37, lng: 132.76 },
  // ── 岡山 ──
  { code: "33100", name: "岡山市",   prefCode: "33", lat: 34.66, lng: 133.93 },
  { code: "33202", name: "倉敷市",   prefCode: "33", lat: 34.59, lng: 133.77 },
  { code: "33203", name: "津山市",   prefCode: "33", lat: 35.07, lng: 134.00 },
  // ── 広島 ──
  { code: "34100", name: "広島市",   prefCode: "34", lat: 34.39, lng: 132.45 },
  { code: "34202", name: "呉市",     prefCode: "34", lat: 34.25, lng: 132.56 },
  { code: "34204", name: "三原市",   prefCode: "34", lat: 34.40, lng: 133.08 },
  { code: "34207", name: "尾道市",   prefCode: "34", lat: 34.41, lng: 133.20 },
  { code: "34208", name: "福山市",   prefCode: "34", lat: 34.49, lng: 133.36 },
  // ── 山口 ──
  { code: "35201", name: "下関市",   prefCode: "35", lat: 33.95, lng: 130.93 },
  { code: "35203", name: "宇部市",   prefCode: "35", lat: 33.95, lng: 131.25 },
  { code: "35204", name: "山口市",   prefCode: "35", lat: 34.19, lng: 131.47 },
  { code: "35208", name: "岩国市",   prefCode: "35", lat: 34.17, lng: 132.22 },
  // ── 徳島 ──
  { code: "36201", name: "徳島市",   prefCode: "36", lat: 34.07, lng: 134.56 },
  // ── 香川 ──
  { code: "37201", name: "高松市",   prefCode: "37", lat: 34.34, lng: 134.05 },
  { code: "37202", name: "丸亀市",   prefCode: "37", lat: 34.29, lng: 133.80 },
  // ── 愛媛 ──
  { code: "38201", name: "松山市",   prefCode: "38", lat: 33.84, lng: 132.77 },
  { code: "38202", name: "今治市",   prefCode: "38", lat: 34.07, lng: 133.00 },
  { code: "38204", name: "新居浜市", prefCode: "38", lat: 33.96, lng: 133.28 },
  // ── 高知 ──
  { code: "39201", name: "高知市",   prefCode: "39", lat: 33.56, lng: 133.53 },
  // ── 福岡 ──
  { code: "40100", name: "北九州市", prefCode: "40", lat: 33.88, lng: 130.88 },
  { code: "40130", name: "福岡市",   prefCode: "40", lat: 33.59, lng: 130.40 },
  { code: "40202", name: "大牟田市", prefCode: "40", lat: 33.03, lng: 130.45 },
  { code: "40203", name: "久留米市", prefCode: "40", lat: 33.32, lng: 130.51 },
  { code: "40205", name: "飯塚市",   prefCode: "40", lat: 33.64, lng: 130.69 },
  { code: "40207", name: "春日市",   prefCode: "40", lat: 33.53, lng: 130.46 },
  // ── 佐賀 ──
  { code: "41201", name: "佐賀市",   prefCode: "41", lat: 33.26, lng: 130.30 },
  { code: "41202", name: "唐津市",   prefCode: "41", lat: 33.45, lng: 129.97 },
  // ── 長崎 ──
  { code: "42201", name: "長崎市",   prefCode: "42", lat: 32.75, lng: 129.88 },
  { code: "42202", name: "佐世保市", prefCode: "42", lat: 33.17, lng: 129.72 },
  // ── 熊本 ──
  { code: "43100", name: "熊本市",   prefCode: "43", lat: 32.80, lng: 130.74 },
  { code: "43202", name: "八代市",   prefCode: "43", lat: 32.50, lng: 130.60 },
  { code: "43204", name: "天草市",   prefCode: "43", lat: 32.46, lng: 130.20 },
  // ── 大分 ──
  { code: "44201", name: "大分市",   prefCode: "44", lat: 33.24, lng: 131.61 },
  { code: "44202", name: "別府市",   prefCode: "44", lat: 33.28, lng: 131.50 },
  // ── 宮崎 ──
  { code: "45201", name: "宮崎市",   prefCode: "45", lat: 31.91, lng: 131.42 },
  { code: "45202", name: "都城市",   prefCode: "45", lat: 31.72, lng: 131.06 },
  // ── 鹿児島 ──
  { code: "46201", name: "鹿児島市", prefCode: "46", lat: 31.60, lng: 130.56 },
  { code: "46203", name: "鹿屋市",   prefCode: "46", lat: 31.38, lng: 130.85 },
  // ── 沖縄 ──
  { code: "47201", name: "那覇市",   prefCode: "47", lat: 26.21, lng: 127.68 },
  { code: "47205", name: "沖縄市",   prefCode: "47", lat: 26.33, lng: 127.80 },
  { code: "47207", name: "浦添市",   prefCode: "47", lat: 26.25, lng: 127.72 },
  { code: "47209", name: "宜野湾市", prefCode: "47", lat: 26.28, lng: 127.78 },
];
