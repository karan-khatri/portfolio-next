import { describe, expect, it, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { useEntityEditor } from "./use-entity-editor";

const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe("useEntityEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows an error toast and does not refresh when publish fails", async () => {
    const publish = vi.fn().mockResolvedValue({ error: "Something went wrong" });
    const { result } = renderHook(() =>
      useEntityEditor({
        saveDraft: vi.fn(),
        publish,
        unpublish: vi.fn(),
        createPreview: vi.fn(),
      }),
    );

    await act(async () => {
      result.current.handlePublish();
    });

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Something went wrong"));
    expect(refresh).not.toHaveBeenCalled();
  });

  it("shows a success toast and refreshes when publish succeeds", async () => {
    const publish = vi.fn().mockResolvedValue({ revisionId: "rev-1" });
    const { result } = renderHook(() =>
      useEntityEditor({
        saveDraft: vi.fn(),
        publish,
        unpublish: vi.fn(),
        createPreview: vi.fn(),
      }),
    );

    await act(async () => {
      result.current.handlePublish();
    });

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Published"));
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("does not refresh when unpublish fails", async () => {
    const unpublish = vi.fn().mockResolvedValue({ error: "Cannot unpublish" });
    const { result } = renderHook(() =>
      useEntityEditor({
        saveDraft: vi.fn(),
        publish: vi.fn(),
        unpublish,
        createPreview: vi.fn(),
      }),
    );

    await act(async () => {
      result.current.handleUnpublish();
    });

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Cannot unpublish"));
    expect(refresh).not.toHaveBeenCalled();
  });

  it("sets a preview URL from the returned token and clears it on the next attempt", async () => {
    const createPreview = vi.fn().mockResolvedValue({ previewToken: "abc123" });
    const { result } = renderHook(() =>
      useEntityEditor({
        saveDraft: vi.fn(),
        publish: vi.fn(),
        unpublish: vi.fn(),
        createPreview,
      }),
    );

    expect(result.current.previewUrl).toBeNull();

    await act(async () => {
      result.current.handlePreview();
    });

    await waitFor(() => expect(result.current.previewUrl).toBe("/preview/abc123"));
  });

  it("does not set a preview URL when the action errors", async () => {
    const createPreview = vi.fn().mockResolvedValue({ error: "Could not create preview" });
    const { result } = renderHook(() =>
      useEntityEditor({
        saveDraft: vi.fn(),
        publish: vi.fn(),
        unpublish: vi.fn(),
        createPreview,
      }),
    );

    await act(async () => {
      result.current.handlePreview();
    });

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Could not create preview"));
    expect(result.current.previewUrl).toBeNull();
  });

  it("copies the preview link only once a preview URL exists", async () => {
    const writeText = vi.fn();
    Object.assign(navigator, { clipboard: { writeText } });

    const { result } = renderHook(() =>
      useEntityEditor({
        saveDraft: vi.fn(),
        publish: vi.fn(),
        unpublish: vi.fn(),
        createPreview: vi.fn().mockResolvedValue({ previewToken: "xyz" }),
      }),
    );

    act(() => {
      result.current.copyPreviewLink();
    });
    expect(writeText).not.toHaveBeenCalled();

    await act(async () => {
      result.current.handlePreview();
    });
    await waitFor(() => expect(result.current.previewUrl).toBe("/preview/xyz"));

    act(() => {
      result.current.copyPreviewLink();
    });
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("/preview/xyz"));
  });
});
