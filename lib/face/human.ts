"use client";

import type { Human, Config } from "@vladmandic/human";

/**
 * Loads the open-source Human face library from our own site (copied there at
 * build time, see scripts/copy-face-assets.mjs). Loaded only when the camera
 * opens, so the rest of the app stays light.
 */
const BASE = "/noprecache/face";

const CONFIG: Partial<Config> = {
  modelBasePath: `${BASE}/models/`,
  backend: "webgl",
  cacheSensitivity: 0,
  debug: false,
  filter: { enabled: true, equalization: true },
  face: {
    enabled: true,
    detector: { rotation: false, maxDetected: 2, return: false },
    mesh: { enabled: true },
    iris: { enabled: true },
    description: { enabled: true },
    emotion: { enabled: false },
    antispoof: { enabled: true },
    liveness: { enabled: true },
  } as Config["face"],
  body: { enabled: false } as Config["body"],
  hand: { enabled: false } as Config["hand"],
  object: { enabled: false } as Config["object"],
  segmentation: { enabled: false } as Config["segmentation"],
  gesture: { enabled: true },
};

let loading: Promise<Human> | null = null;

export function loadHuman(): Promise<Human> {
  if (!loading) {
    loading = (async () => {
      const mod = (await import(/* webpackIgnore: true */ `${BASE}/human.esm.js`)) as { Human: new (c: Partial<Config>) => Human };
      const human = new mod.Human(CONFIG);
      await human.load();
      await human.warmup();
      return human;
    })().catch((err) => {
      loading = null; // allow a retry
      throw err;
    });
  }
  return loading;
}

/** A random ID kept on this phone, so the server can spot one phone checking in two people. */
export function deviceId(): string | undefined {
  try {
    let id = localStorage.getItem("whippie:device");
    if (!id) {
      id = (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36)).replace(/-/g, "");
      localStorage.setItem("whippie:device", id);
    }
    return id;
  } catch {
    return undefined;
  }
}
