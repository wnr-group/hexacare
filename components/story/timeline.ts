import gsap from "gsap";
import { storyConfig, type SceneKey } from "./story.config";
import { CITY_OFFSETS, LAYOUT, wallCellPos, type StoryState } from "./state";

const HALF_PI = Math.PI / 2;

/**
 * Builds the single master timeline. It drives the camera, the characters' action states,
 * environment grading, hex cells and prop visibility by writing into the shared StoryState.
 * Captions / counters are derived from `timeline.time()` in the DOM layer, so seeking works.
 */
export function buildTimeline(s: StoryState) {
  const cfg = storyConfig;
  const tl = gsap.timeline({ paused: true, repeat: cfg.loop ? -1 : 0 });

  const sc = (k: SceneKey) => ({ a: cfg.scenes[k][0], len: cfg.scenes[k][1] - cfg.scenes[k][0] });
  /** absolute time at fraction f of a scene */
  const at = (k: SceneKey, f: number) => sc(k).a + f * sc(k).len;
  /** duration as fraction of a scene */
  const dur = (k: SceneKey, f: number) => f * sc(k).len;

  const cam = (t: number, d: number, v: Partial<StoryState["cam"]>, ease = "power2.inOut") =>
    tl.to(s.cam, { ...v, duration: d, ease }, t);
  const P = s.patient;
  const E = s.expert;
  const D = s.delivery;

  /* ------------------------------------------------------------------ 0–6s intro */
  const I = LAYOUT.intro;
  tl.set(s.cam, { px: I.x, py: I.y + 0.2, pz: 7, tx: I.x, ty: I.y, tz: I.z }, 0);
  tl.set(P, { action: "sitSick" }, 0);
  cam(0, at("intro", 0.72), { pz: 5.2 }, "sine.inOut");
  tl.to(s, { particles: 1, duration: dur("intro", 0.6), ease: "power2.inOut" }, 0);
  tl.to(s, { logo: 1, duration: dur("intro", 0.28), ease: "power2.out" }, at("intro", 0.48));
  tl.to(s, { particleFade: 0, duration: dur("intro", 0.25), ease: "power1.in" }, at("intro", 0.8));
  tl.to(s, { world: 1, duration: dur("intro", 0.55), ease: "power2.out" }, at("intro", 0.6));

  // fall into the world
  const descentStart = at("intro", 0.72);
  const descentEnd = at("illness", 0.16);
  cam(
    descentStart,
    descentEnd - descentStart,
    { px: -4.6, py: 2.4, pz: 6.2, tx: -1.0, ty: 0.9, tz: -1.5 },
    "power3.inOut",
  );
  tl.to(s, { intro: 0, duration: descentEnd - descentStart, ease: "power1.inOut" }, descentStart);

  /* ------------------------------------------------------------ 6–14s tired at home */
  tl.to(s, { pain: 1, duration: 1.2, ease: "power2.out" }, at("illness", 0.1));
  cam(descentEnd, sc("illness").a + sc("illness").len - descentEnd, { px: -3.7, py: 1.9, pz: 4.6, tx: -1.2, ty: 1.0, tz: -1.7 }, "sine.inOut");
  tl.set(P, { action: "cough" }, at("illness", 0.3));
  tl.set(P, { action: "sitSick" }, at("illness", 0.3) + 1.6);
  tl.set(P, { action: "cough" }, at("illness", 0.72));
  tl.set(P, { action: "sitSick" }, at("illness", 0.72) + 1.4);

  /* --------------------------------------------------------- 14–20s finds Hexacare */
  const dA = sc("discover").a;
  tl.set(P, { action: "sitPhone" }, dA + 0.2);
  tl.to(P, { lookX: -1.0, lookY: 1.05, lookZ: -1.15, lookW: 1, duration: 0.6 }, dA + 0.2);
  tl.to(s, { phone: 1, duration: 0.9, ease: "back.out(2)" }, at("discover", 0.12));
  tl.to(s, { grade: 0.5, duration: dur("discover", 0.45), ease: "power1.inOut" }, at("discover", 0.25));
  cam(dA, dur("discover", 0.26), { px: -3.0, py: 1.7, pz: 1.9, tx: -1.1, ty: 1.1, tz: -1.7 });
  cam(dA + dur("discover", 0.26), dur("discover", 0.4), { px: -2.7, py: 1.65, pz: 2.3 }, "sine.inOut");
  const flyStart = at("discover", 0.68);
  const svcA = sc("services").a;
  const flyEnd = svcA + 0.6;
  cam(flyStart, flyEnd - flyStart, { px: 14.8, py: 2.9, pz: 10.2, tx: 14.8, ty: 2.2, tz: -1 }, "power2.inOut");
  tl.to(s, { phone: 0, duration: 0.3 }, svcA + 0.7);
  tl.to(P, { lookW: 0, duration: 0.3 }, svcA + 0.7);
  tl.set(P, { action: "sitSick" }, svcA + 0.7);

  /* -------------------------------------------------- 20–30s expert + service honeycomb */
  tl.to(E, { visible: 1, duration: 0.7, ease: "back.out(1.6)" }, svcA - 0.2);
  tl.to(s, { honey: 1, duration: 1.8, ease: "power2.out" }, svcA - 0.2);
  tl.to(s, { grade: 0.75, duration: 1.5, ease: "power1.inOut" }, svcA);
  tl.set(E, { action: "wave" }, svcA + 0.4);
  tl.to(E, { lookX: 16, lookY: 1.6, lookZ: 8.6, lookW: 1, duration: 0.5 }, svcA + 0.3);
  const pointStart = svcA + 2.5;
  const per = (sc("services").a + sc("services").len - 0.6 - pointStart) / 6;
  tl.set(E, { action: "point" }, pointStart - 0.05);
  tl.to(E, { aimX: 14.5, aimY: 3.4, aimZ: -2.2, duration: 0.01 }, pointStart - 0.06);
  cam(flyEnd, pointStart - flyEnd, { px: 14.2, py: 2.8, pz: 9.8, tx: 14.2, ty: 2.5, tz: -1.5 }, "sine.inOut");
  for (let i = 0; i < 6; i++) {
    const t = pointStart + i * per;
    const [cx, cy, cz] = wallCellPos(i);
    tl.to(s.svc, { [i]: 1, duration: 0.6, ease: "back.out(1.8)" }, svcA + 0.5 + i * 0.18);
    tl.set(s, { svcActive: i }, t);
    tl.to(E, { aimX: cx, aimY: cy, aimZ: cz, lookX: cx, lookY: cy, lookZ: cz, duration: per * 0.4, ease: "power2.inOut" }, t);
    cam(t, per, { px: 14.2 + (cx - 16) * 0.25, py: 2.8 + (cy - 2.9) * 0.2, pz: 9.8 - i * 0.25, tx: 14.2 + (cx - 14.2) * 0.35, ty: 2.5 + (cy - 2.9) * 0.35, tz: cz }, "sine.inOut");
  }
  const pointEnd = pointStart + 6 * per;
  tl.set(s, { svcActive: -1 }, pointEnd);
  tl.set(E, { action: "talk" }, pointEnd);
  tl.to(E, { lookX: 16, lookY: 1.6, lookZ: 8.6, duration: 0.4 }, pointEnd);
  tl.set(E, { action: "idle" }, at("delivery", 0.2));
  tl.to(E, { lookX: 10, lookY: 1.2, lookZ: 2.3, duration: 0.8 }, at("delivery", 0.1));

  /* -------------------------------------------- 30–38s medicine travels, partner delivers */
  const delA = sc("delivery").a;
  const rowZ = LAYOUT.pathRow.z;
  cam(pointEnd, delA + 1.2 - pointEnd, { px: 11.5, py: 4.0, pz: 8.6, tx: 11.5, ty: 0.9, tz: rowZ }, "power2.inOut");
  tl.to(D, { visible: 1, duration: 0.6, ease: "back.out(1.6)" }, delA + 0.3);
  tl.to(D, { lookX: 12, lookY: 1.2, lookZ: rowZ, lookW: 1, duration: 0.4 }, delA + 0.3);
  tl.set(s.medicine, { visible: 1, x: 15.7, y: 0.9, z: rowZ }, delA + 0.4);
  tl.to(s, { path: 1, duration: 3.2, ease: "none" }, delA + 0.4);
  tl.to(s.medicine, { x: 13.1, duration: 0.7, ease: "power2.inOut" }, delA + 1.0);
  tl.to(s.medicine, { x: 10.5, duration: 0.7, ease: "power2.inOut" }, delA + 1.9);
  tl.to(s.medicine, { x: 8.65, y: 1.05, duration: 0.8, ease: "power2.inOut" }, delA + 2.8);
  tl.set(D, { action: "handOver" }, delA + 3.5);
  tl.to(D, { ry: -HALF_PI, duration: 0.4, ease: "power2.inOut" }, delA + 3.9);
  tl.to(s.medicine, { x: 7.75, duration: 0.4, ease: "power2.inOut" }, delA + 3.9);
  tl.set(D, { action: "walk", carry: 1 }, delA + 4.0);
  tl.to(D, { lookX: 3.4, lookY: 1.4, lookZ: rowZ, duration: 0.5 }, delA + 4.0);
  const arriveT = delA + 7.0;
  tl.to(D, { x: 5.0, duration: arriveT - (delA + 4.0), ease: "none" }, delA + 4.0);
  tl.to(s.medicine, { x: 4.55, duration: arriveT - (delA + 4.0), ease: "none" }, delA + 4.0);
  cam(delA + 1.2, delA + 5.2 - (delA + 1.2), { px: 6.8, py: 2.3, pz: 7.0, tx: 6.2, ty: 1.1, tz: rowZ }, "sine.inOut");
  cam(delA + 5.2, arriveT - (delA + 5.2) + 0.3, { px: 7.4, py: 2.0, pz: 8.6, tx: 4.4, ty: 1.0, tz: rowZ });

  // patient gets up and slowly walks to the door
  const standT = delA + 2.4;
  tl.to(P, { seated: 0, duration: 0.7, ease: "power1.inOut" }, standT);
  tl.set(P, { action: "walk" }, standT + 0.5);
  tl.to(P, { ry: 0.81, duration: 0.4 }, standT + 0.4);
  tl.to(P, { x: 3.0, z: rowZ, duration: arriveT - (standT + 0.6), ease: "sine.inOut" }, standT + 0.6);
  tl.to(P, { ry: HALF_PI, duration: 0.4 }, arriveT - 0.2);

  // hand-over
  tl.set(P, { action: "handOver" }, arriveT);
  tl.set(D, { action: "handOver", carry: 0 }, arriveT);
  tl.to(s.medicine, { x: 3.55, y: 1.1, duration: 0.6, ease: "power2.inOut" }, arriveT);

  /* ----------------------------------------------- 38–46s takes medicine, recovers */
  const recA = sc("recovery").a;
  tl.set(P, { action: "drink" }, recA + 0.5);
  tl.to(P, { ry: 0.6, duration: 0.5 }, recA + 0.4);
  tl.to(s, { cup: 1, duration: 0.3 }, recA + 0.5);
  tl.to(s.medicine, { visible: 0, duration: 0.01 }, recA + 0.8);
  cam(recA, dur("recovery", 0.5), { px: 7.4, py: 2.0, pz: 8.4, tx: 4.2, ty: 1.0, tz: rowZ }, "sine.inOut");
  tl.to(s, { grade: 1, duration: 3.2, ease: "power1.inOut" }, recA + 1.0);
  tl.to(P, { tint: 1, duration: 3.2, ease: "power1.inOut" }, recA + 1.0);
  tl.to(s, { pain: 0, duration: 2.2, ease: "power2.in" }, recA + 1.2);
  tl.to(s, { cup: 0, duration: 0.3 }, recA + 2.2);
  tl.set(P, { action: "idle" }, recA + 2.3);
  tl.to(P, { lookX: 6.5, lookY: 1.5, lookZ: 6, lookW: 1, duration: 0.5 }, recA + 2.3);
  tl.set(P, { action: "stretch" }, at("recovery", 0.52));
  tl.set(P, { action: "happy" }, at("recovery", 0.74));
  tl.set(D, { action: "wave" }, recA + 0.8);
  tl.to(D, { ry: -0.6, duration: 0.4 }, recA + 0.6);
  tl.set(D, { action: "idle" }, recA + 3.0);
  cam(at("recovery", 0.5), dur("recovery", 0.5) - 0.4, { px: 4.8, py: 1.9, pz: 8.2, tx: 3.5, ty: 1.0, tz: rowZ }, "sine.inOut");

  /* ----------------------------------------------------- 46–52s hex map, branches, counters */
  const impA = sc("impact").a;
  const IX = LAYOUT.impact.x;
  const finA = sc("finale").a;
  cam(impA - 0.4, dur("impact", 0.45), { px: IX, py: 8.6, pz: 9.2, tx: IX, ty: 0.4, tz: 0 }, "power3.inOut");
  const impCam2 = impA - 0.4 + dur("impact", 0.45);
  cam(impCam2, finA - 0.7 - impCam2, { py: 6.6, pz: 7.2 }, "sine.inOut");
  CITY_OFFSETS.forEach((_, i) => {
    tl.to(s.city, { [i]: 1, duration: 0.7, ease: "back.out(2)" }, at("impact", 0.3 + 0.13 * i));
  });

  /* ------------------------------------------------ 52–58s everyone together + logo */
  const gather = finA - 0.7;
  tl.set(P, { x: 15.0, y: 0, z: 1.5, ry: 0.15, action: "happy", seated: 0, lookW: 0.6, lookX: 16, lookY: 1.6, lookZ: 9 }, gather);
  tl.set(E, { x: 16.0, z: 1.8, ry: 0, action: "wave", lookX: 16, lookY: 1.6, lookZ: 9, lookW: 1, visible: 1 }, gather);
  tl.set(D, { x: 17.0, z: 1.5, ry: -0.15, action: "celebrate", carry: 0, lookX: 16, lookY: 1.6, lookZ: 9, lookW: 0.6, visible: 1 }, gather);
  tl.set(s, { svcActive: -1, honey: 1, path: 1 }, gather);
  cam(gather, 2.2, { px: 16, py: 2.2, pz: 12.5, tx: 16, ty: 1.1, tz: 0 }, "power3.inOut");
  cam(gather + 2.2, finA + sc("finale").len - (gather + 2.2), { py: 2.1, pz: 11.6 }, "sine.inOut");
  tl.to(s, { finale: 1, duration: 3, ease: "power2.inOut" }, finA);
  tl.set(E, { action: "talk" }, finA + 2.0);

  // pad so duration is the last scene end (+ the CTA hold when looping)
  const total = cfg.scenes.finale[1] + (cfg.loop ? cfg.loopDelay : 0);
  tl.set({}, {}, total);
  return { tl, marks: { pointStart, per, pipeStart: delA + 0.4, impactStart: impA, finaleStart: finA } };
}
