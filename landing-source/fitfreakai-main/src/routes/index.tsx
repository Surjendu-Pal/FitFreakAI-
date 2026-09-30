import { createFileRoute } from "@tanstack/react-router";

import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/sections/Hero";
import { Problem, Solution } from "@/components/sections/Problem";
import { AdaptivePlans, AiCore, Why } from "@/components/sections/Why";
import { ExerciseCoach, Privacy } from "@/components/sections/Privacy";
import { Avatar, Gamification, Wellness } from "@/components/sections/Game";
import { Community, Mentorship } from "@/components/sections/Community";
import {
  Architecture,
  Ecosystem,
  Impact,
  Journey,
  Safety,
} from "@/components/sections/Tech";
import { FinalCta } from "@/components/sections/FinalCta";

const title = "FitFreak AI — Your Fitness. Your AI. Your Privacy.";
const description =
  "An adaptive AI fitness ecosystem that plans, coaches, analyzes and motivates you — while keeping sensitive camera processing on your device.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <Why />
        <AiCore />
        <AdaptivePlans />
        <Privacy />
        <ExerciseCoach />
        <Gamification />
        <Avatar />
        <Wellness />
        <Community />
        <Mentorship />
        <Architecture />
        <Ecosystem />
        <Journey />
        <Impact />
        <Safety />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
