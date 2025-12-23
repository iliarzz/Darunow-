import { randomUUID, createHash } from "crypto";

export type VideoActorType = "user" | "provider";

export interface VideoProvider {
  createRoom(teleVisitId: string, expiresAt: Date): Promise<{ roomId: string }>;
  createJoinToken(teleVisitId: string, actorType: VideoActorType, actorId: string, ttlSeconds: number): Promise<{
    token: string;
    tokenHash: string;
  }>;
  endRoom(roomId: string): Promise<void>;
}

class WebRtcStubProvider implements VideoProvider {
  async createRoom(teleVisitId: string): Promise<{ roomId: string }> {
    return { roomId: `stub-room-${teleVisitId}-${randomUUID()}` };
  }

  async createJoinToken(teleVisitId: string, actorType: VideoActorType, actorId: string): Promise<{ token: string; tokenHash: string }> {
    const token = `${teleVisitId}.${actorType}.${actorId}.${randomUUID()}`;
    const tokenHash = createHash("sha256").update(token).digest("hex");
    return { token, tokenHash };
  }

  async endRoom(): Promise<void> {
    return;
  }
}

export function getVideoProvider(): VideoProvider {
  const provider = (process.env.VIDEO_PROVIDER ?? "webrtc_stub").toLowerCase();
  switch (provider) {
    case "daily":
    case "twilio":
      // Placeholder until production adapter wired
      return new WebRtcStubProvider();
    default:
      return new WebRtcStubProvider();
  }
}

export const videoProvider = getVideoProvider();
