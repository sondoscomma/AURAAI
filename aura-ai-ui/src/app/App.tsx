import type { JSX } from "react";
import { useRoutes } from "react-router-dom";
import { routes } from "./routes";


export default function App(): JSX.Element {
  return useRoutes(routes);
  
}
