import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

export async function fetchKanji(query: string) {
  const res = await axios.get(`${API_BASE}/api/kanji/${encodeURIComponent(query)}`);
  console.log(res.data.json())
  return res.data.json();
}

export async function fetchParts(kanji: string) {
  const res = await axios.get(`${API_BASE}/api/kanji/${encodeURIComponent(kanji)}/parts`);
  return res.data.json();
}

export async function fetchRelated(part: string, page: number = 0) {
  const res = await axios.get(`${API_BASE}/api/part/${encodeURIComponent(part)}?page=${page}`);
  
  return res.data.json();
}
