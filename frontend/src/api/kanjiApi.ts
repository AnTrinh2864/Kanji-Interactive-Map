import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

export async function fetchKanji(character: string) {
  try {
    const response = await axios.get(
      `${API_BASE}/kanji/${encodeURIComponent(character)}`
    );
    if (response.data.error) {
        throw new Error("400 Kanji Not Found")
    }
    return response.data;
  } catch (err: any) {
    if (err.response) {
      // Backend returned a non-2xx status code
      throw new Error(err.response.data.detail || "Kanji not found");
    } else {
      // Network error, CORS, etc
      throw new Error(err.message);
    }
  }
}
