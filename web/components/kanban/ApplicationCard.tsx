import { useRef } from "react";
import { Draggable } from "@hello-pangea/dnd";
import type { Application } from "@/types";
import { APPLICATION_TYPE_LABELS, WEB_TEST_STATUS_LABELS } from "@/types";
import { getDeadlineUrgency } from "@/lib/date";

interface ApplicationCardProps {
  application: Application;
  index: number;
  onCardClick: (app: Application) => void;
}

export function ApplicationCard({
  application,
  index,
  onCardClick,
}: ApplicationCardProps) {
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);
  const formattedDate = application.next_interview_at
    ? new Date(application.next_interview_at).toLocaleDateString("ja-JP", {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const interviewTime = application.next_interview_at
    ? new Date(application.next_interview_at).getTime()
    : null;
  const now = new Date().getTime();
  const isInterviewSoon =
    interviewTime !== null &&
    interviewTime - now < 3 * 24 * 60 * 60 * 1000 &&
    interviewTime > now;

  return (
    <Draggable draggableId={application.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="md-card"
          onPointerDown={(e) => {
            pointerDownPos.current = { x: e.clientX, y: e.clientY };
          }}
          onClick={(e) => {
            if (!pointerDownPos.current) return;
            const dx = e.clientX - pointerDownPos.current.x;
            const dy = e.clientY - pointerDownPos.current.y;
            if (Math.sqrt(dx * dx + dy * dy) < 8) {
              onCardClick(application);
            }
          }}
          style={{
            cursor: snapshot.isDragging ? "grabbing" : "pointer",
            transform: snapshot.isDragging
              ? `${provided.draggableProps.style?.transform ?? ""} rotate(1.5deg)`
              : provided.draggableProps.style?.transform,
            boxShadow: snapshot.isDragging
              ? "var(--md-elev-4)"
              : "var(--md-elev-1)",
            userSelect: "none",
            ...provided.draggableProps.style,
          }}
        >
          <div className="p-3">
            {/* Company name & position */}
            <div className="min-w-0">
              <p
                className="md-title-small truncate"
                style={{ color: "var(--md-on-surface)" }}
              >
                {application.company_name}
              </p>
              {application.position_name && (
                <p
                  className="md-body-small truncate mt-0.5"
                  style={{ color: "var(--md-on-surface-variant)" }}
                >
                  {application.position_name}
                </p>
              )}
            </div>

            {/* Chips row: application_type / web_test_status / deadline */}
            {(application.application_type ||
              application.web_test_status === "not_taken" ||
              application.deadline) && (
              <div className="mt-2 flex flex-wrap gap-1">
                {application.application_type && (
                  <span
                    className="md-label-small inline-flex items-center px-2 py-0.5 rounded-full"
                    style={{
                      background: "var(--md-surface-container-high)",
                      color: "var(--md-on-surface-variant)",
                    }}
                  >
                    {APPLICATION_TYPE_LABELS[application.application_type]}
                  </span>
                )}
                {application.web_test_status === "not_taken" && (
                  <span
                    className="md-label-small inline-flex items-center px-2 py-0.5 rounded-full"
                    style={{ background: "#FFF3CD", color: "#7B5800" }}
                  >
                    {WEB_TEST_STATUS_LABELS["not_taken"]}
                  </span>
                )}
                {application.deadline && (() => {
                  const urgency = getDeadlineUrgency(application.deadline);
                  const label = new Date(
                    application.deadline + "T00:00:00"
                  ).toLocaleDateString("ja-JP", {
                    month: "numeric",
                    day: "numeric",
                  });
                  const style =
                    urgency === "expired"
                      ? {
                          background: "var(--md-error-container)",
                          color: "var(--md-on-error-container)",
                        }
                      : urgency === "soon"
                        ? { background: "#FFE0C2", color: "#8B4000" }
                        : {
                            background: "var(--md-surface-container-high)",
                            color: "var(--md-on-surface-variant)",
                          };
                  const icon = urgency === "expired" ? " ⚠" : urgency === "soon" ? " ⚡" : "";
                  return (
                    <span
                      className="md-label-small inline-flex items-center px-2 py-0.5 rounded-full"
                      style={style}
                    >
                      締切 {label}{icon}
                    </span>
                  );
                })()}
              </div>
            )}

            {/* Interview date chip */}
            {formattedDate && (
              <div className="mt-2">
                <span
                  className="md-label-small inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                  style={
                    isInterviewSoon
                      ? { background: "#FFE0C2", color: "#8B4000" }
                      : {
                          background: "var(--md-surface-container-high)",
                          color: "var(--md-on-surface-variant)",
                        }
                  }
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formattedDate}
                  {isInterviewSoon && " ⚡"}
                </span>
              </div>
            )}

            {/* Memo */}
            {application.memo && (
              <p
                className="md-body-small mt-2 line-clamp-2 leading-relaxed"
                style={{ color: "var(--md-on-surface-variant)" }}
              >
                {application.memo}
              </p>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
