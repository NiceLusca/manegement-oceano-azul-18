
import React from "react";
import type { Task } from '@/types';

// Define and export the context (context only)
export interface DragAndDropContextType {
  draggedTask: Task | null;
  setDraggedTask: (task: Task | null) => void;
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, task: Task) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>, status: string) => Promise<void>;
  handleTaskStatusUpdate: (taskId: string, newStatus: string) => Promise<boolean>;
}
export const DragAndDropContext = React.createContext<DragAndDropContextType | undefined>(undefined);
