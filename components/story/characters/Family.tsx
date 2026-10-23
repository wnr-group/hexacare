"use client";
import Character from "./Character";
import { storyConfig } from "../story.config";

export default function Family() {
  return <Character id="family" role="family" modelUrl={storyConfig.models.family} />;
}
