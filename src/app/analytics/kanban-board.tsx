"use client";

import { useState, useEffect } from "react";
import { useZenStore } from "@/lib/store";
import { TaskStatus } from "@/types";
import { CircleDashed, Timer, CheckCircle2, Clock } from "lucide-react";
import { KanbanColumn } from "@/components/ui/kanban/column";
import { KanbanCard } from "@/components/ui/kanban/card";

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

  // Mensaje de estado cuando no hay tareas disponibles aún
  const todoEmptyState = (
    <div className="flex flex-col items-center justify-center flex-1 text-center opacity-60">
      <Clock className="w-8 h-8 text-text-3 mb-2" />
      <p className="text-xs text-text-3 font-medium">No hay tareas pendientes para esta hora.</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      {/* COLUMNA 1: Por Empezar (Se llena progresivamente) */}
      <KanbanColumn
        title="Desbloqueadas"
        icon={CircleDashed}
        count={columns.TODO.length}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, TaskStatus.PENDING)}
        emptyState={todoEmptyState}
      >
        {columns.TODO.map((task) => (
          <KanbanCard
            key={task.id}
            id={task.id}
            title={task.title}
            subject={task.subject}
            timeString={
              task.scheduledStart
                ? new Date(task.scheduledStart).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })
                : "--:--"
            }
            timeRequired={task.metrics?.timeRequired}
            priority={task.calculatedPriority}
            borderClass="border-l-text-3"
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          />
        ))}
      </KanbanColumn>

      {/* COLUMNA 2: En Progreso */}
      <KanbanColumn
        title="En Foco"
        icon={Timer}
        count={columns.IN_PROGRESS.length}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, TaskStatus.IN_PROGRESS)}
        bgClass="bg-primary/5 border-primary/10 hover:bg-primary/10"
        titleClassName="text-primary"
        countClassName="bg-primary/20 text-primary"
      >
        {columns.IN_PROGRESS.map((task) => (
          <KanbanCard
            key={task.id}
            id={task.id}
            title={task.title}
            subject={task.subject}
            timeString={
              task.scheduledStart
                ? new Date(task.scheduledStart).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })
                : "--:--"
            }
            timeRequired={task.metrics?.timeRequired}
            priority={task.calculatedPriority}
            borderClass="border-l-primary"
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          />
        ))}
      </KanbanColumn>

      {/* COLUMNA 3: Terminadas */}
      <KanbanColumn
        title="Terminadas"
        icon={CheckCircle2}
        count={columns.DONE.length}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, TaskStatus.COMPLETED)}
        bgClass="bg-accent/5 border-accent/10 hover:bg-accent/10"
        titleClassName="text-accent"
        countClassName="bg-accent/20 text-accent"
      >
        {columns.DONE.map((task) => (
          <KanbanCard
            key={task.id}
            id={task.id}
            title={task.title}
            subject={task.subject}
            timeString={
              task.scheduledStart
                ? new Date(task.scheduledStart).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })
                : "--:--"
            }
            timeRequired={task.metrics?.timeRequired}
            priority={task.calculatedPriority}
            borderClass="border-l-accent opacity-60 hover:opacity-100"
            isCompleted
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          />
        ))}
      </KanbanColumn>

    </div>
  );
}
