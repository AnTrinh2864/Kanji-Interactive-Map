import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api";

// 🔍 Search kanji or words
export async function fetchKanji(query: string) {
  const res = await axios.get(`${API_BASE}/kanji/${encodeURIComponent(query)}`);
  return res.data;
}

export async function fetchParts(kanji: string) {
  const res = await axios.get(`${API_BASE}/kanji/${encodeURIComponent(kanji)}/parts`);
  return res.data;
}

export async function fetchRelated(part: string, page: number = 0) {
  const res = await axios.get(`${API_BASE}/parts/${encodeURIComponent(part)}?page=${page}`);
  console.log(res.data)
  return res.data;
}
