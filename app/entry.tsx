import "./globals.css";
import "./tour.css";
import {createRoot} from "react-dom/client";
import Passport from "./passport";
createRoot(document.getElementById("app")!).render(<Passport/>);
