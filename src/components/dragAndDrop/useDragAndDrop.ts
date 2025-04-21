
import { useContext } from "react";
import { DragAndDropContext } from "./DragAndDropContext";

export const useDragAndDrop = () => {
  const context = useContext(DragAndDropContext);
  if (context === undefined) {
    throw new Error('useDragAndDrop deve ser usado dentro de um DragAndDropProvider');
  }
  return context;
};
