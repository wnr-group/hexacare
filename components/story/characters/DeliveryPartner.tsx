"use client";
import Character from "./Character";
import { storyConfig } from "../story.config";

export default function DeliveryPartner() {
  return <Character id="delivery" role="delivery" modelUrl={storyConfig.models.delivery} />;
}
