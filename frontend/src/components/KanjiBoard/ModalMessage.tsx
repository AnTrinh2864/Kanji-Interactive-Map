import { useEffect } from "react";
import "./ModalMessage.css";

interface ModalMessageProps {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
}

export function ModalMessage({ message, type = "success", onClose }: ModalMessageProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2000); 
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`modal-message ${type}`}>
      {message}
    </div>
  );
}
