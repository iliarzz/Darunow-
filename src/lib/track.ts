type TrackProps = Record<string, unknown>;

export function track(event: string, props: TrackProps = {}): void {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log("[track]", event, props);
  }
}
