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
      
    ],
  },
  {
    element: <AppLayout />,
    children: [
      { path: "/app", element: <Dashboard /> },
      { path: "/app/chat", element: <Chat /> },
      {path: "/app/generation",element:<Generation/>}
    ],
  },
];
