import { Droppable } from "@hello-pangea/dnd";
import type { Application, ApplicationStatus } from "@/types";
import { STATUS_LABELS } from "@/types";
import { ApplicationCard } from "./ApplicationCard";

interface KanbanColumnProps {
  status: ApplicationStatus;
  applications: Application[];
  onEdit: (app: Application) => void;
  onDelete: (id: string) => void;
}

type StatusConfig = {
  dot: string;
  chipBg: string;
  chipColor: string;
  dropBg: string;
};

const STATUS_CONFIG: Record<ApplicationStatus, StatusConfig> = {
  interest: {
    dot: "var(--md-on-surface-variant)",
    chipBg: "var(--md-surface-container)",
    chipColor: "var(--md-on-surface-variant)",
    dropBg: "var(--md-surface-container-high)",
  },
  applied: {
    dot: "var(--md-primary)",
    chipBg: "var(--md-primary-container)",
    chipColor: "var(--md-on-primary-container)",
    dropBg: "#E3EEFF",
  },
  document_passed: {
    dot: "#7B5800",
    chipBg: "#FFF3CD",
    chipColor: "#7B5800",
    dropBg: "#FFF8E7",
  },
  interviewing: {
    dot: "#8B4000",
    chipBg: "#FFE0C2",
    chipColor: "#8B4000",
    dropBg: "#FFF0E4",
  },
  offer: {
    dot: "#006637",
    chipBg: "#C9EFDB",
    chipColor: "#006637",
    dropBg: "#E5F9EE",
  },
  rejected: {
    dot: "var(--md-error)",
    chipBg: "var(--md-error-container)",
    chipColor: "var(--md-on-error-container)",
    dropBg: "#FFF0EF",
  },
};

export function KanbanColumn({
  status,
  applications,
  onEdit,
  onDelete,
}: KanbanColumnProps) {
  const cfg = STATUS_CONFIG[status];

  return (
    /* On mobile: snap to this column. On desktop: fixed 272px width */
    <div
      className="flex flex-col shrink-0"
      style={{
        width: "min(272px, 85vw)",
        scrollSnapAlign: "start",
      }}
    >
      {/* Column header */}
      <div className="flex items-center justify-between mb-2 px-0.5">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: cfg.dot }}
          />
          <span
            className="md-title-small"
            style={{ color: "var(--md-on-surface)" }}
          >
            {STATUS_LABELS[status]}
          </span>
        </div>
        <span
          className="md-label-medium px-2.5 py-0.5 rounded-full"
          style={{ background: cfg.chipBg, color: cfg.chipColor }}
        >
          {applications.length}
        </span>
      </div>

      {/* Drop zone */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex flex-col gap-2 min-h-[120px] rounded-xl p-2 transition-colors duration-150"
            style={{
              background: snapshot.isDraggingOver
                ? cfg.dropBg
                : "var(--md-surface-container)",
              outline: snapshot.isDraggingOver
                ? `2px solid ${cfg.dot}`
                : "2px solid transparent",
            }}
          >
            {applications.map((app, index) => (
              <ApplicationCard
                key={app.id}
                application={app}
                index={index}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
            {provided.placeholder}

            {applications.length === 0 && !snapshot.isDraggingOver && (
              <div
                className="flex items-center justify-center h-16 rounded-lg"
                style={{
                  border: `1.5px dashed var(--md-outline-variant)`,
                  color: "var(--md-on-surface-variant)",
                }}
              >
                <p className="md-label-medium opacity-60">カードをドロップ</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
