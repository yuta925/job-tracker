import { Draggable } from "@hello-pangea/dnd";
import type { Application } from "@/types";
import { APPLICATION_TYPE_LABELS, WEB_TEST_STATUS_LABELS } from "@/types";
import { getDeadlineUrgency } from "@/lib/date";

interface ApplicationCardProps {
  application: Application;
  index: number;
  onEdit: (app: Application) => void;
  onDelete: (id: string) => void;
}

export function ApplicationCard({
  application,
  index,
  onEdit,
  onDelete,
}: ApplicationCardProps) {
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
          className="md-card group"
          style={{
            cursor: snapshot.isDragging ? "grabbing" : "grab",
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
            {/* Company & actions */}
            <div className="flex items-start gap-1">
              <div className="flex-1 min-w-0">
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

              {/* Actions — visible on hover / focus-within */}
              <div className="flex shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {application.application_url && (
                  <a
                    href={application.application_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="w-8 h-8 rounded-full flex items-center justify-center md-state"
                    style={{ color: "var(--md-on-surface-variant)" }}
                    aria-label="求人ページを開く"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(application);
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center md-state"
                  style={{ color: "var(--md-on-surface-variant)" }}
                  aria-label="編集"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`「${application.company_name}」を削除しますか？`)) {
                      onDelete(application.id);
                    }
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center md-state"
                  style={{ color: "var(--md-error)" }}
                  aria-label="削除"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
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
