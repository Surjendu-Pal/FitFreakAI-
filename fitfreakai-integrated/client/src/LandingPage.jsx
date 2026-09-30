import { Nav } from "./components/site/Nav";
import { Footer } from "./components/site/Footer";
import { Hero } from "./components/sections/Hero";
import { Problem, Solution } from "./components/sections/Problem";
import { AdaptivePlans, AiCore, Why } from "./components/sections/Why";
import { ExerciseCoach, Privacy } from "./components/sections/Privacy";
import { Avatar, Gamification, Wellness } from "./components/sections/Game";
import { Community, Mentorship } from "./components/sections/Community";
import {
  Architecture,
  Ecosystem,
  Impact,
  Journey,
  Safety,
} from "./components/sections/Tech";
import { FinalCta } from "./components/sections/FinalCta";

export default function LandingPage() {
  return (
    <div className="landing-page min-h-screen bg-background text-foreground">
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