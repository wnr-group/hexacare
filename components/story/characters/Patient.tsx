"use client";
import Character from "./Character";
import { storyConfig } from "../story.config";

export default function Patient() {
  return <Character id="patient" role="patient" modelUrl={storyConfig.models.patient} />;
}
