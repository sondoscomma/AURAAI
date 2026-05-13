import type { RouteObject } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";
import AppLayout from "../layouts/AppLayout";

import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import Chat from "../pages/Chat";
import Hero from "../components/Hero";
import HowItwork from "../components/HowItWorks";
import Pricing from "../components/Pricing";
import Features from "../components/Features";
import Contact from "../components/Contact";
import Generation from "../pages/Generation";
import UploadGarment from "../pages/UploadGarment";
import UploadYourModel from "../pages/UploadYourModel";
import GenerateAiModel from "../pages/GenerateAiModel";
import AuraModels from "../pages/AuraModels";
import ProfileSettings from "../pages/ProfileSettings";
import GenerationResult from "../pages/GenerationResult";
import GenerationResultForModel from "../pages/GenerationResultForModel";
import TryOnResult from "../pages/TryOnResult";
import GarmentChatAdjust from "../pages/Garchat";

export const routes: RouteObject[] = [
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <Landing /> },
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
      { path: "/pricing", element: <Pricing /> },
      { path: "/hero", element: <Hero /> },
      { path: "/how-it-works", element: <HowItwork /> },
      { path: "/features", element: <Features /> },
      { path: "/contact", element: <Contact /> },
      { path: "/app/generation", element: <Generation /> },
      { path: "/app/upload-garment", element: <UploadGarment /> },
      { path: "/app/upload-your-model", element: <UploadYourModel /> },
      { path: "/app/generate-ai-model", element: <GenerateAiModel /> },
      { path: "/app/aura-models", element: <AuraModels /> },
      { path: "/app/generation-result", element: <GenerationResult /> },
      { path: "/app/generation-result-model", element: <GenerationResultForModel /> },
      { path: "/app/tryon-result", element: <TryOnResult /> },
      { path: "/app/garment-chat-adjust", element: <GarmentChatAdjust /> },
      { path: "/app/profile", element: <ProfileSettings /> },
    ],
  },
  {
    element: <AppLayout />,
    children: [
      { path: "/app", element: <Dashboard /> },
      { path: "/app/chat", element: <Chat /> },
    ],
  },
];
