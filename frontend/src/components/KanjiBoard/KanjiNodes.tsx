
import React from "react";

export const KanjiNode = ({ data }: { data: any }) => {
  const mainMeaning = data.meanings?.[0] || data.meaning || "";
  return (
    <div style={{
      padding: "8px",
      border: "2px solid #5ca448",
      borderRadius: "6px",
      textAlign: "center",
      backgroundColor: "white",
      minWidth: "50px"
    }}>
      <div style={{ fontSize: "24px", fontWeight: "bold", color: "#26472b" }}>{data.kanji}</div>
      {mainMeaning && <div style={{ fontSize: "12px", color: "#555", marginTop: "2px" }}>{mainMeaning}</div>}
    </div>
  );
};

export const PartNode = ({ data }: { data: any }) => {
  return (
    <div style={{
      padding: "6px",
      border: "2px solid #00796b",
      borderRadius: "6px",
      textAlign: "center",
      backgroundColor: "white",
      minWidth: "40px",
      fontSize: "14px",
      color: "#004d40"
    }}>
      {data.label}
    </div>
  );
};

export const MoreNode = ({ data }: { data: any }) => {
  return (
    <div style={{
      padding: "6px",
      border: "2px dashed #999",
      borderRadius: "6px",
      textAlign: "center",
      fontStyle: "italic",
      color: "#555"
    }}>
      ...
    </div>
  );
};
