import gsap from "gsap";
import { storyConfig, type SceneKey } from "./story.config";
import { CITY_OFFSETS, LAYOUT, wallCellPos, type CharState, type StoryState } from "./state";

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
  const end = (k: SceneKey) => cfg.scenes[k][1];
  const dur = (k: SceneKey, f: number) => f * sc(k).len;

  const cam = (t: number, d: number, v: Partial<StoryState["cam"]>, ease = "power2.inOut") =>
    tl.to(s.cam, { ...v, duration: d, ease }, t);
  /** point a character's head at a world position */
  const look = (c: CharState, t: number, x: number, y: number, z: number, w = 1, d = 0.45) =>
    tl.to(c, { lookX: x, lookY: y, lookZ: z, lookW: w, duration: d, ease: "power2.inOut" }, t);
  const pop = (c: CharState, t: number, d = 0.6) => tl.to(c, { visible: 1, duration: d, ease: "back.out(1.6)" }, t);
  const act = (c: CharState, t: number, a: CharState["action"]) => tl.set(c, { action: a }, t);

  const P = s.patient;
  const F = s.family;
  const Dr = s.doctor;
  const E = s.expert;
  const D = s.delivery;
  const rowZ = LAYOUT.pathRow.z;
  const DX = LAYOUT.doctor.x;

  /* ------------------------------------------------------------------ 0–6s intro */
  const I = LAYOUT.intro;
  tl.set(s.cam, { px: I.x, py: I.y + 0.2, pz: 7, tx: I.x, ty: I.y, tz: I.z }, 0);
  cam(0, at("intro", 0.72), { pz: 5.2 }, "sine.inOut");
  tl.to(s, { particles: 1, duration: dur("intro", 0.6), ease: "power2.inOut" }, 0);
  tl.to(s, { logo: 1, duration: dur("intro", 0.28), ease: "power2.out" }, at("intro", 0.48));
  tl.to(s, { particleFade: 0, duration: dur("intro", 0.25), ease: "power1.in" }, at("intro", 0.8));
  tl.to(s, { world: 1, duration: dur("intro", 0.55), ease: "power2.out" }, at("intro", 0.6));

  // fall into the doctor's room
  const descentStart = at("intro", 0.72);
  const descentEnd = at("diagnosis", 0.16);
  cam(descentStart, descentEnd - descentStart, { px: DX + 0.4, py: 2.0, pz: 6.4, tx: DX + 0.6, ty: 1.1, tz: -0.6 }, "power3.inOut");
  tl.to(s, { intro: 0, duration: descentEnd - descentStart, ease: "power1.inOut" }, descentStart);

  /* ------------------------------------------- 6–14s diagnosis, prescription, worried family */
  const dgA = sc("diagnosis").a;
  [P, F, Dr].forEach((c, i) => pop(c, dgA - 0.1 + i * 0.12));
  tl.to(s, { pain: 1, duration: 1.2, ease: "power2.out" }, dgA + 1.0);
  const patientHead: [number, number, number] = [DX + 1.4, 1.2, -0.6];
  const familyHead: [number, number, number] = [DX + 2.6, 1.5, -0.6];
  const doctorHead: [number, number, number] = [DX - 1.2, 1.5, -0.6];
  cam(descentEnd, end("diagnosis") - 0.8 - descentEnd, { px: DX + 0.9, py: 1.7, pz: 5.4, tx: DX + 0.6, ty: 1.2, tz: -0.6 }, "sine.inOut");

  act(Dr, dgA + 0.9, "talk");
  look(Dr, dgA + 0.9, ...patientHead);
  look(P, dgA + 1.5, DX - 1.0, 1.0, -0.6, 0.5);
  look(F, dgA + 1.2, ...doctorHead, 0.8);
  act(Dr, dgA + 3.1, "write");
  look(Dr, dgA + 3.1, DX, 0.7, -0.6);
  tl.set(s.rx, { visible: 1, x: DX + 0.05, y: 0.8, z: -0.7 }, dgA + 3.1);
  act(Dr, dgA + 5.4, "handOver");
  look(Dr, dgA + 5.4, ...familyHead);
  act(F, dgA + 5.5, "handOver");
  tl.to(s.rx, { x: DX + 2.3, y: 1.05, z: -0.6, duration: 1.0, ease: "power2.inOut" }, dgA + 5.6);
  act(F, dgA + 6.7, "nod");

  // cut to the family's home
  const cutAt = end("diagnosis") - 0.65;
  tl.to(s, { cut: 1, duration: 0.35, ease: "power1.in" }, cutAt);
  tl.set(s.rx, { visible: 0 }, cutAt + 0.4);
  tl.set(Dr, { visible: 0 }, cutAt + 0.4);
  tl.set(P, { x: -1.2, z: -2.0, ry: 0, seated: 1, action: "sitSick", lookW: 0 }, cutAt + 0.4);
  tl.set(F, { x: 0.7, z: -0.5, ry: 0, action: "phone", lookW: 0 }, cutAt + 0.4);
  tl.set(s.cam, { px: -3.6, py: 1.8, pz: 5.6, tx: 0.0, ty: 1.1, tz: -1.2 }, cutAt + 0.4);
  tl.to(s, { cut: 0, duration: 0.4, ease: "power1.out" }, cutAt + 0.45);

  /* ------------------------------------------ 14–22s the search: nothing available */
  const seA = sc("search").a;
  cam(seA, sc("search").len, { px: -2.4, py: 1.7, pz: 4.6, tx: 0.2, ty: 1.4, tz: -0.8 }, "sine.inOut");
  tl.to(s, { lost: 1, duration: dur("search", 0.8), ease: "power1.out" }, seA + 0.6);
  look(F, seA + 0.2, 0.7, 1.2, -0.3, 0.6);
  act(F, at("search", 0.55), "talk");
  look(F, at("search", 0.55), -1.2, 1.2, -2.0, 0.9);
  act(F, at("search", 0.8), "phone");

  /* ---------------------------------- 22–30s a glowing path leads to Hexacare */
  const dsA = sc("discover").a;
  const walkA = dsA + 0.9;
  const walkB = end("discover") - 0.8;
  tl.to(s, { lost: 0, duration: 0.7, ease: "power2.in" }, dsA);
  tl.to(s, { grade: 0.6, duration: dur("discover", 0.7), ease: "power1.inOut" }, dsA + 0.5);
  tl.to(P, { seated: 0, duration: 0.7, ease: "power1.inOut" }, dsA + 0.3);
  tl.to(P, { tint: 0.35, duration: dur("discover", 0.7) }, dsA + 1);
  tl.to(F, { tint: 0.6, duration: dur("discover", 0.7) }, dsA + 1);
  act(P, walkA, "walk");
  act(F, walkA - 0.2, "walk");
  tl.to(P, { ry: 1.0, duration: 0.5 }, walkA - 0.4);
  tl.to(F, { ry: 1.0, duration: 0.5 }, walkA - 0.4);
  tl.to(P, { ry: HALF_PI, duration: 0.6 }, walkA + 1.8);
  tl.to(F, { ry: HALF_PI, duration: 0.6 }, walkA + 1.8);
  tl.to(P, { x: 17.6, duration: walkB - walkA, ease: "power1.inOut" }, walkA);
  tl.to(P, { z: rowZ, duration: 1.8, ease: "power1.inOut" }, walkA);
  tl.to(F, { x: 18.9, duration: walkB - walkA, ease: "power1.inOut" }, walkA - 0.2);
  tl.to(F, { z: 3.0, duration: 1.8, ease: "power1.inOut" }, walkA - 0.2);
  tl.to(s, { guide: 1, duration: walkB - walkA, ease: "power1.inOut" }, walkA);
  look(P, walkA, 14, 1.5, rowZ, 0.5);
  look(F, walkA, 14, 1.5, rowZ, 0.5);
  cam(dsA + 1.0, walkB - dsA - 1.0 + 0.4, { px: 17.0, py: 2.4, pz: 9.0, tx: 15.5, ty: 1.3, tz: 1.5 }, "power1.inOut");
  // they arrive and turn to face the pharmacist
  act(P, walkB, "idle");
  act(F, walkB, "idle");
  tl.to(P, { ry: -1.15, duration: 0.6 }, walkB - 0.1);
  tl.to(F, { ry: -1.15, duration: 0.6 }, walkB - 0.1);
  // the pharmacist steps in to welcome them
  pop(E, walkB - 2.4);
  act(E, walkB - 1.6, "wave");
  look(E, walkB - 1.8, 16, 1.6, 8.6);

  /* --------------------------------------------- 30–42s service honeycomb */
  const svcA = sc("services").a;
  const svcEnd = end("services");
  tl.to(s, { honey: 1, duration: 1.8, ease: "power2.out" }, svcA - 0.6);
  tl.to(s, { grade: 0.8, duration: 1.5, ease: "power1.inOut" }, svcA);
  cam(walkB + 0.4, svcA + 0.9 - (walkB + 0.4), { px: 14.2, py: 3.0, pz: 12.2, tx: 14.2, ty: 2.8, tz: -1 }, "power2.inOut");
  const pointStart = svcA + 2.8;
  const per = (svcEnd - 1.2 - pointStart) / cfg.services.length;
  cam(svcA + 0.9, pointStart - svcA - 0.9, { px: 14.2, py: 3.0, pz: 11.8, tx: 14.2, ty: 3.0, tz: -1.5 }, "sine.inOut");
  act(E, pointStart - 0.05, "point");
  tl.to(E, { aimX: 14.5, aimY: 3.4, aimZ: -2.2, duration: 0.01 }, pointStart - 0.06);
  cfg.services.forEach((_, i) => {
    const t = pointStart + i * per;
    const [cx, cy, cz] = wallCellPos(i);
    tl.to(s.svc, { [i]: 1, duration: 0.6, ease: "back.out(1.8)" }, svcA + 0.2 + i * 0.18);
    tl.set(s, { svcActive: i }, t);
    tl.to(E, { aimX: cx, aimY: cy, aimZ: cz, lookX: cx, lookY: cy, lookZ: cz, duration: per * 0.4, ease: "power2.inOut" }, t);
    look(P, t + 0.1, cx, cy, cz, 0.7);
    look(F, t + 0.15, cx, cy, cz, 0.7);
    if (i % 2 === 1) {
      act(F, t + 0.5, "nod");
      act(F, t + 1.1, "idle");
    }
    cam(t, per, { px: 14.2 + (cx - 16) * 0.25, py: 3.0 + (cy - 2.9) * 0.2, pz: 11.8 - i * 0.25, tx: 14.2 + (cx - 14.2) * 0.35, ty: 3.0 + (cy - 2.9) * 0.3, tz: cz }, "sine.inOut");
  });
  const pointEnd = pointStart + cfg.services.length * per;
  tl.set(s, { svcActive: -1 }, pointEnd);
  act(E, pointEnd, "talk");
  look(E, pointEnd, 16, 1.6, 8.6);
  look(P, pointEnd, 16, 1.6, 8.6, 0.4);
  look(F, pointEnd, 16, 1.6, 8.6, 0.4);
  act(P, pointEnd, "relieved");

  /* ----------------------------- 42–50s supply chain, partner carries the package */
  const spA = sc("supply").a;
  tl.to(s, { guide: 0, duration: 0.8 }, spA - 0.8);
  tl.to([P, F], { visible: 0, duration: 0.3 }, spA - 0.6);
  cam(pointEnd, spA + 1.2 - pointEnd, { px: 11.5, py: 4.0, pz: 8.6, tx: 11.5, ty: 0.9, tz: rowZ }, "power2.inOut");
  tl.set(E, { action: "idle" }, spA + 0.2);
  look(E, spA + 0.1, 10, 1.2, rowZ);
  pop(D, spA + 0.3);
  look(D, spA + 0.3, 12, 1.2, rowZ);
  tl.set(s.medicine, { visible: 1, x: 15.7, y: 0.9, z: rowZ }, spA + 0.4);
  tl.to(s, { path: 1, duration: 3.2, ease: "none" }, spA + 0.4);
  tl.to(s.medicine, { x: 13.1, duration: 0.7, ease: "power2.inOut" }, spA + 1.0);
  tl.to(s.medicine, { x: 10.5, duration: 0.7, ease: "power2.inOut" }, spA + 1.9);
  tl.to(s.medicine, { x: 8.65, y: 1.05, duration: 0.8, ease: "power2.inOut" }, spA + 2.8);
  act(D, spA + 3.5, "handOver");
  tl.to(D, { ry: -HALF_PI, duration: 0.4, ease: "power2.inOut" }, spA + 3.9);
  tl.to(s.medicine, { x: 7.75, duration: 0.4, ease: "power2.inOut" }, spA + 3.9);
  tl.set(D, { action: "walk", carry: 1 }, spA + 4.0);
  look(D, spA + 4.0, 3.4, 1.4, rowZ, 1, 0.5);
  const arriveT = spA + 7.0;
  tl.to(D, { x: 5.0, duration: arriveT - (spA + 4.0), ease: "none" }, spA + 4.0);
  tl.to(s.medicine, { x: 4.55, duration: arriveT - (spA + 4.0), ease: "none" }, spA + 4.0);
  cam(spA + 1.2, 4.0, { px: 6.8, py: 2.3, pz: 7.0, tx: 6.2, ty: 1.1, tz: rowZ }, "sine.inOut");
  cam(spA + 5.2, arriveT - (spA + 5.2) + 0.3, { px: 7.4, py: 2.0, pz: 8.6, tx: 4.4, ty: 1.0, tz: rowZ });

  // patient and family come home to the door
  const homeT = spA + 2.2;
  tl.set(P, { x: 0.9, z: rowZ, ry: HALF_PI, seated: 0, action: "walk", visible: 1, tint: 0.35, lookW: 0 }, homeT);
  tl.set(F, { x: 0.0, z: 3.0, ry: HALF_PI, action: "walk", visible: 1, tint: 0.6, lookW: 0 }, homeT);
  tl.to(P, { x: 3.0, duration: arriveT - homeT - 0.2, ease: "sine.out" }, homeT);
  tl.to(F, { x: 2.1, duration: arriveT - homeT - 0.2, ease: "sine.out" }, homeT);
  act(F, arriveT - 0.2, "idle");
  look(F, arriveT - 0.2, 4.0, 1.2, rowZ, 0.8);

  // hand-over
  act(P, arriveT, "handOver");
  tl.set(D, { action: "handOver", carry: 0 }, arriveT);
  tl.to(s.medicine, { x: 3.55, y: 1.1, duration: 0.6, ease: "power2.inOut" }, arriveT);

  /* ----------------------------- 50–57s relief, recovery, everyone together */
  const rcA = sc("recovery").a;
  const rcEnd = end("recovery");
  act(P, rcA + 0.5, "drink");
  tl.to(P, { ry: 0.6, duration: 0.5 }, rcA + 0.4);
  tl.to(s, { cup: 1, duration: 0.3 }, rcA + 0.5);
  tl.to(s.medicine, { visible: 0, duration: 0.01 }, rcA + 0.8);
  cam(spA + 7.3, rcA + 3.0 - (spA + 7.3), { px: 7.4, py: 2.0, pz: 8.4, tx: 4.2, ty: 1.0, tz: rowZ }, "sine.inOut");
  tl.to(s, { grade: 1, duration: 3.2, ease: "power1.inOut" }, rcA + 1.0);
  tl.to(P, { tint: 1, duration: 3.2, ease: "power1.inOut" }, rcA + 1.0);
  tl.to(F, { tint: 1, duration: 3.2, ease: "power1.inOut" }, rcA + 1.4);
  tl.to(s, { pain: 0, duration: 2.2, ease: "power2.in" }, rcA + 1.2);
  tl.to(s, { cup: 0, duration: 0.3 }, rcA + 2.2);
  act(P, rcA + 2.3, "relieved");
  act(F, rcA + 1.8, "relieved");
  look(P, rcA + 2.3, 5, 1.5, 9, 0.6);
  act(D, rcA + 0.8, "wave");
  tl.to(D, { ry: -0.5, duration: 0.4 }, rcA + 0.6);
  act(D, rcA + 2.6, "idle");

  // doctor and pharmacist join; everyone lines up facing the camera
  const gA = rcA + 3.2;
  const lineZ = 3.4;
  tl.set(Dr, { x: 5.9, y: 0, z: lineZ, ry: 0.1, action: "nod", tint: 1, seated: 0 }, gA);
  look(Dr, gA, 4.6, 1.6, 10, 0.7, 0.01);
  pop(Dr, gA + 0.1);
  tl.set(E, { x: 7.1, y: 0, z: lineZ, ry: -0.1, action: "wave", lookX: 4.6, lookY: 1.6, lookZ: 10, lookW: 0.7 }, gA + 0.4);
  pop(E, gA + 0.45);
  tl.to(D, { x: 4.7, z: lineZ, ry: 0.0, duration: 1.2, ease: "power1.inOut" }, gA - 0.4);
  tl.to(F, { x: 2.2, z: lineZ, ry: 0.0, duration: 1.0, ease: "power1.inOut" }, gA - 0.4);
  tl.to(P, { x: 3.45, z: lineZ, ry: 0.0, duration: 1.0, ease: "power1.inOut" }, gA - 0.2);
  act(P, gA - 0.3, "walk");
  act(F, gA - 0.3, "walk");
  act(D, gA - 0.3, "walk");
  act(P, gA + 0.9, "stretch");
  act(F, gA + 0.9, "idle");
  act(D, gA + 1.0, "idle");
  act(P, gA + 2.0, "happy");
  act(F, gA + 2.2, "celebrate");
  act(D, gA + 2.2, "celebrate");
  act(E, gA + 2.0, "talk");
  tl.set([P, F, D, Dr, E], { lookX: 4.6, lookY: 1.6, lookZ: 10, lookW: 0.6 }, gA + 1.2);
  cam(gA - 0.2, rcEnd - 0.6 - (gA - 0.2), { px: 4.7, py: 1.9, pz: 11.0, tx: 4.6, ty: 1.0, tz: 3.0 }, "sine.inOut");

  /* ----------------------------------------------- 57–60.5s reach map and counters */
  const impA = sc("impact").a;
  const IX = LAYOUT.impact.x;
  const finA = sc("finale").a;
  cam(rcEnd - 0.6, 2.3, { px: IX, py: 8.6, pz: 9.2, tx: IX, ty: 0.4, tz: 0 }, "power3.inOut");
  cam(rcEnd + 1.7, finA - 0.7 - (rcEnd + 1.7), { py: 6.6, pz: 7.2 }, "sine.inOut");
  CITY_OFFSETS.forEach((_, i) => {
    tl.to(s.city, { [i]: 1, duration: 0.6, ease: "back.out(2)" }, impA + 0.25 + i * 0.4);
  });

  /* ------------------------------------------ 60.5–64s all together + logo + CTA */
  const gather = finA - 0.7;
  const row: [CharState, number, CharState["action"]][] = [
    [F, 12.8, "celebrate"],
    [P, 14.4, "happy"],
    [E, 16.0, "wave"],
    [Dr, 17.6, "nod"],
    [D, 19.2, "celebrate"],
  ];
  row.forEach(([c, x, a]) => {
    tl.set(c, { x, y: 0, z: 1.6, ry: 0, action: a, seated: 0, carry: 0, tint: 1, visible: 1, lookX: 16, lookY: 1.6, lookZ: 14, lookW: 0.6 }, gather);
  });
  tl.set(s, { svcActive: -1, honey: 1, path: 1, guide: 0 }, gather);
  cam(gather, 2.2, { px: 16, py: 2.2, pz: 14.2, tx: 16, ty: 1.1, tz: 0 }, "power3.inOut");
  cam(gather + 2.2, finA + sc("finale").len - (gather + 2.2), { py: 2.1, pz: 13.2 }, "sine.inOut");
  tl.to(s, { finale: 1, duration: 3, ease: "power2.inOut" }, finA);

  // pad so duration is the last scene end (+ the CTA hold when looping)
  const total = cfg.scenes.finale[1] + (cfg.loop ? cfg.loopDelay : 0);
  tl.set({}, {}, total);
  return {
    tl,
    marks: { pointStart, per, pipeStart: spA + 0.4, impactStart: impA, finaleStart: finA },
  };
}
