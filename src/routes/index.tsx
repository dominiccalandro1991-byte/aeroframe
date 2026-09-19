import { createFileRoute } from "@tanstack/react-router";
import { AeroframeApp } from "@/components/aeroframe/app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <AeroframeApp />;
}
