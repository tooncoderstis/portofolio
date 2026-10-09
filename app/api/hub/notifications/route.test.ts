import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  isOwner: vi.fn(),
  listNotifications: vi.fn(),
  markAllNotificationsRead: vi.fn(),
}));

vi.mock("@/lib/hub/session", () => ({ isOwner: mocks.isOwner }));
vi.mock("@/lib/hub/store", () => ({
  listNotifications: mocks.listNotifications,
  markAllNotificationsRead: mocks.markAllNotificationsRead,
}));

import { GET, POST } from "./route";

beforeEach(() => {
  mocks.isOwner.mockReset();
  mocks.listNotifications.mockReset();
  mocks.markAllNotificationsRead.mockReset();
  mocks.isOwner.mockResolvedValue(true);
  mocks.listNotifications.mockResolvedValue([]);
});

describe("/api/hub/notifications", () => {
  it("menolak akses bukan owner", async () => {
    mocks.isOwner.mockResolvedValue(false);

    expect((await GET()).status).toBe(401);
    expect((await POST()).status).toBe(401);
  });

  it("mengembalikan daftar notifikasi", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ notifications: [] });
  });

  it("menandai semua dibaca", async () => {
    const response = await POST();

    expect(response.status).toBe(200);
    expect(mocks.markAllNotificationsRead).toHaveBeenCalledOnce();
  });
});
