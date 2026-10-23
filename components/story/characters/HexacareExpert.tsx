"use client";
import Character from "./Character";
import { storyConfig } from "../story.config";

export default function HexacareExpert() {
  return <Character id="expert" role="expert" modelUrl={storyConfig.models.expert} />;
}
