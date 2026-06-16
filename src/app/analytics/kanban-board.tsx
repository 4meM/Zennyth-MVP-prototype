"use client";

import { useState, useEffect } from "react";
import { useZenStore } from "@/lib/store";
import { TaskStatus } from "@/types";
import { CircleDashed, Timer, CheckCircle2, Clock, Tag } from "lucide-react";

export function KanbanBoard() {
  const { tasks, updateTaskStatus } = useZenStore();

  // 1. ESTADO PARA LA HORA ACTUAL
  const [currentTime, setCurrentTime] = useState(new Date());

  // 2. Temporizador que actualiza la hora exacta cada minuto
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

// 3. Agrupamos y filtramos las tareas
  const columns = {
    TODO: tasks.filter((t) => {
      const isPending = t.status === TaskStatus.PENDING || t.status === TaskStatus.OVERDUE || !t.status;
      if (!isPending) return false;

      // Si no tiene hora programada, la mostramos para que no quede invisible
      if (!t.scheduledStart) return true;

      // EL FIX: Comparamos puramente la hora del día, ignorando la fecha exacta
      const startTime = new Date(t.scheduledStart);
      const taskTimeInMinutes = (startTime.getHours() * 60) + startTime.getMinutes();
      const currentTimeInMinutes = (currentTime.getHours() * 60) + currentTime.getMinutes();

      // Solo mostramos la tarea si los minutos transcurridos del día actual 
      // son mayores o iguales a la hora en la que debía empezar.
      return taskTimeInMinutes <= currentTimeInMinutes;
    }),
    IN_PROGRESS: tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS),
    DONE: tasks.filter((t) => t.status === TaskStatus.COMPLETED),
  };

  // --- LÓGICA DE ARRASTRAR Y SOLTAR ---
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
    setTimeout(() => {
      (e.target as HTMLElement).style.opacity = "0.5";
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.target as HTMLElement).style.opacity = "1";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); 
  };

  const handleDrop = (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      updateTaskStatus(taskId, newStatus);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* COLUMNA 1: Por Empezar (Se llena progresivamente) */}
      <div 
        className="flex flex-col bg-bg-subtle/30 rounded-xl p-4 min-h-[400px] border border-border/50 transition-colors hover:bg-bg-subtle/50"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, TaskStatus.PENDING)}
      >
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-xs font-bold text-text-2 flex items-center gap-2 uppercase tracking-wider">
            <CircleDashed className="w-4 h-4" /> Desbloqueadas
          </h3>
          <span className="bg-surface text-text-2 text-[10px] px-2 py-1 rounded-full font-bold shadow-sm">{columns.TODO.length}</span>
        </div>
        
        {/* Mensaje de estado cuando no hay tareas disponibles aún */}
        {columns.TODO.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 text-center opacity-60">
            <Clock className="w-8 h-8 text-text-3 mb-2" />
            <p className="text-xs text-text-3 font-medium">No hay tareas pendientes para esta hora.</p>
          </div>
        )}

        <div className="flex flex-col gap-3 flex-1">
          {columns.TODO.map((task) => (
            <KanbanCard key={task.id} task={task} onDragStart={handleDragStart} onDragEnd={handleDragEnd} borderClass="border-l-text-3" />
          ))}
        </div>
      </div>

      {/* COLUMNA 2: En Progreso */}
      <div 
        className="flex flex-col bg-primary/5 rounded-xl p-4 min-h-[400px] border border-primary/10 transition-colors hover:bg-primary/10"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, TaskStatus.IN_PROGRESS)}
      >
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-xs font-bold text-primary flex items-center gap-2 uppercase tracking-wider">
            <Timer className="w-4 h-4" /> En Foco
          </h3>
          <span className="bg-primary/20 text-primary text-[10px] px-2 py-1 rounded-full font-bold shadow-sm">{columns.IN_PROGRESS.length}</span>
        </div>
        <div className="flex flex-col gap-3 flex-1">
          {columns.IN_PROGRESS.map((task) => (
            <KanbanCard key={task.id} task={task} onDragStart={handleDragStart} onDragEnd={handleDragEnd} borderClass="border-l-primary" />
          ))}
        </div>
      </div>

      {/* COLUMNA 3: Terminadas */}
      <div 
        className="flex flex-col bg-accent/5 rounded-xl p-4 min-h-[400px] border border-accent/10 transition-colors hover:bg-accent/10"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, TaskStatus.COMPLETED)}
      >
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-xs font-bold text-accent flex items-center gap-2 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" /> Terminadas
          </h3>
          <span className="bg-accent/20 text-accent text-[10px] px-2 py-1 rounded-full font-bold shadow-sm">{columns.DONE.length}</span>
        </div>
        <div className="flex flex-col gap-3 flex-1">
          {columns.DONE.map((task) => (
            <KanbanCard key={task.id} task={task} onDragStart={handleDragStart} onDragEnd={handleDragEnd} borderClass="border-l-accent opacity-60 hover:opacity-100" />
          ))}
        </div>
      </div>

    </div>
  );
}

// --- SUBCOMPONENTE: LA TARJETA VISUAL ---
function KanbanCard({ task, onDragStart, onDragEnd, borderClass }: { task: any, onDragStart: any, onDragEnd: any, borderClass: string }) {
  // Formatear la hora de inicio para mostrarla en la tarjeta
  const timeString = task.scheduledStart 
    ? new Date(task.scheduledStart).toLocaleTimeString("es", { hour: '2-digit', minute: '2-digit' })
    : "--:--";

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      className={`bg-surface p-4 rounded-lg border-l-4 ${borderClass} border-y border-r border-y-border border-r-border shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group`}
    >
      {task.subject && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Tag className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold uppercase text-primary tracking-wider">{task.subject}</span>
          </div>
          {/* Mostramos la hora a la que se desbloqueó */}
          <span className="text-[10px] font-bold text-text-3 bg-bg-subtle px-1.5 py-0.5 rounded">{timeString}</span>
        </div>
      )}
      
      <h4 className={`text-sm font-semibold text-text-1 mb-3 leading-snug group-hover:text-primary transition-colors ${task.status === TaskStatus.COMPLETED ? 'line-through text-text-3' : ''}`}>
        {task.title}
      </h4>
      
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
        <div className="flex items-center gap-1.5 text-text-3">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-[11px] font-medium">{task.metrics?.timeRequired}h est.</span>
        </div>
        <div className="text-[10px] font-bold text-text-2 bg-bg-subtle px-2 py-1 rounded-md">
          PRI: {task.calculatedPriority}
        </div>
      </div>
    </div>
  );
}