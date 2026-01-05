import { generateId } from "@/lib/storage";
import type { PaymentStatus } from "./types";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function buildIdempotencyKey(prefix: string, provided?: string) {
  return provided ?? generateId(prefix);
}

export async function initiatePayment(orderId: string, opts?: { idempotencyKey?: string }): Promise<{
  paymentUrl: string;
  paymentIntentId: string;
  idempotencyKey: string;
}> {
  const idempotencyKey = buildIdempotencyKey("idem-init", opts?.idempotencyKey);
  const paymentIntentId = generateId("pi");
  await wait(300);
  const callbackParams = new URLSearchParams({
    orderId,
    payment_intent: paymentIntentId,
    status: "success",
    ref: generateId("ref").slice(-8),
  });
  const paymentUrl = `${process.env.NEXT_PUBLIC_PSP_REDIRECT ?? ""}/pay/callback?${callbackParams.toString()}`;
  return { paymentUrl, paymentIntentId, idempotencyKey };
}

export async function verifyPayment(
  paymentIntentId: string,
  opts?: { idempotencyKey?: string },
): Promise<{ status: PaymentStatus; refId?: string; idempotencyKey: string }> {
  const idempotencyKey = buildIdempotencyKey("idem-verify", opts?.idempotencyKey);
  await wait(400);
  const success = paymentIntentId.length % 2 === 0;
  const status: PaymentStatus = success ? "SUCCESS" : "FAILED";
  const refId = success ? generateId("shp").slice(-10) : undefined;
  return { status, refId, idempotencyKey };
}
