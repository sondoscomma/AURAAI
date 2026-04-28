
import { useRoutes } from "react-router-dom";
import { routes } from "./routes";


export default function App(): React.ReactElement | null  {
  return useRoutes(routes);
  
}
