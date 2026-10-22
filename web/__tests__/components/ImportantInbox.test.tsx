import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ImportantInbox } from "@/components/home/ImportantInbox";

afterEach(() => {
  vi.unstubAllGlobals();
  window.history.replaceState({}, "", "/");
});

describe("Gmail取得失敗の案内", () => {
  it("原因を表示し、未有効化で再連携を促したり成功通知を重ねたりしない", async () => {
    window.history.replaceState({}, "", "/dashboard?gmail=connected");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok:false,
      json:async()=>({error:"Google CloudでGmail APIが有効になっていません。",reconnect:false}),
    }));
    render(<ImportantInbox />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Gmail APIが有効になっていません");
    expect(screen.queryByRole("link", {name:"Gmailを再連携"})).not.toBeInTheDocument();
    expect(screen.queryByText("Gmailと連携しました。")).not.toBeInTheDocument();
  });
});
