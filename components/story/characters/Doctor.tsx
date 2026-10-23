"use client";
import Character from "./Character";
import { storyConfig } from "../story.config";

export default function Doctor() {
  return <Character id="doctor" role="doctor" modelUrl={storyConfig.models.doctor} />;
}
