import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  isOwner: vi.fn(),
  savePushSubscription: vi.fn(),
  removePushSubscription: vi.fn(),
}));

vi.mock("@/lib/hub/session", () => ({ isOwner: mocks.isOwner }));
vi.mock("@/lib/hub/store", () => ({
  savePushSubscription: mocks.savePushSubscription,
  removePushSubscription: mocks.removePushSubscription,
}));

import { DELETE, POST } from "./route";

const subscription = {
  endpoint: "https://push.example.com/abc",
  keys: { p256dh: "kunci", auth: "auth" },
};

function request(body: unknown, method = "POST") {
  return new Request("http://test/api/hub/push/subscribe", {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  mocks.isOwner.mockReset();
  mocks.savePushSubscription.mockReset();
  mocks.removePushSubscription.mockReset();
  mocks.isOwner.mockResolvedValue(true);
});

describe("/api/hub/push/subscribe", () => {
  it("menolak bila bukan owner", async () => {
    mocks.isOwner.mockResolvedValue(false);

    const response = await POST(request(subscription));

    expect(response.status).toBe(401);
  });

  it("menyimpan langganan valid", async () => {
    const response = await POST(request(subscription));

    expect(response.status).toBe(201);
    expect(mocks.savePushSubscription).toHaveBeenCalledWith(subscription);
  });

  it("menolak langganan tidak valid", async () => {
    const response = await POST(request({ endpoint: "bukan-url" }));

    expect(response.status).toBe(400);
    expect(mocks.savePushSubscription).not.toHaveBeenCalled();
  });

  it("menghapus langganan", async () => {
    const response = await DELETE(
      request({ endpoint: subscription.endpoint }, "DELETE"),
    );

    expect(response.status).toBe(200);
    expect(mocks.removePushSubscription).toHaveBeenCalledWith(
      subscription.endpoint,
    );
  });
});
