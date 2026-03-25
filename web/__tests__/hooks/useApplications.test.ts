import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useApplications } from "@/hooks/useApplications";
import type { Application } from "@/types";

const makeApp = (overrides: Partial<Application> = {}): Application => ({
  id: "1",
  user_id: "user-1",
  company_name: "A社",
  position_name: null,
  status: "applied",
  next_interview_at: null,
  memo: null,
  application_url: null,
  application_type: null,
  web_test_status: null,
  deadline: null,
  created_at: "2026-03-01T00:00:00Z",
  updated_at: "2026-03-01T00:00:00Z",
  ...overrides,
});

vi.mock("@/lib/applications/queries", () => ({
  fetchApplications: vi.fn().mockResolvedValue([
    {
      id: "1",
      user_id: "user-1",
      company_name: "A社",
      position_name: null,
      status: "applied",
      next_interview_at: null,
      memo: null,
      application_url: null,
      created_at: "2026-03-01T00:00:00Z",
      updated_at: "2026-03-01T00:00:00Z",
    },
    {
      id: "2",
      user_id: "user-1",
      company_name: "B社",
      position_name: "PM",
      status: "interest",
      next_interview_at: null,
      memo: null,
      application_url: null,
      created_at: "2026-03-02T00:00:00Z",
      updated_at: "2026-03-02T00:00:00Z",
    },
  ]),
  createApplication: vi.fn().mockImplementation((data: Record<string, unknown>) =>
    Promise.resolve({
      id: "new-id",
      user_id: "user-1",
      created_at: "",
      updated_at: "",
      ...data,
    })
  ),
  updateApplication: vi.fn().mockImplementation((id: string, data: Record<string, unknown>) =>
    Promise.resolve({
      id,
      user_id: "user-1",
      company_name: "A社",
      position_name: null,
      status: "applied",
      next_interview_at: null,
      memo: null,
      application_url: null,
      created_at: "",
      updated_at: "",
      ...data,
    })
  ),
  updateApplicationStatus: vi.fn().mockResolvedValue(undefined),
  deleteApplication: vi.fn().mockResolvedValue(undefined),
}));

describe("useApplications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("初期ロード時にアプリケーション一覧を取得する", async () => {
    const { result } = renderHook(() => useApplications());
    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.applications).toHaveLength(2);
  });

  it("updateStatus でステータスをオプティミスティック更新する", async () => {
    const { result } = renderHook(() => useApplications());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    await act(async () => {
      await result.current.updateStatus("1", "interviewing");
    });

    const updated = result.current.applications.find((a) => a.id === "1");
    expect(updated?.status).toBe("interviewing");
  });

  it("deleteApp でアプリケーションを削除する", async () => {
    const { result } = renderHook(() => useApplications());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    await act(async () => {
      await result.current.deleteApp("1");
    });

    expect(result.current.applications.find((a) => a.id === "1")).toBeUndefined();
    expect(result.current.applications).toHaveLength(1);
  });

  // makeApp は型チェック用のヘルパーとして利用可能
  it("makeApp ヘルパーが正しいデフォルト値を返す", () => {
    const app = makeApp({ company_name: "C社" });
    expect(app.company_name).toBe("C社");
    expect(app.status).toBe("applied");
  });
});
