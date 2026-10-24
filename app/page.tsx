import { client } from "@/lib/client-config";
import type { Metadata } from "next";
import LandingExperience from "./components/LandingExperience";
export const metadata:Metadata={title:`${client.name} | ${client.tagline}`,description:"Explore Endowal’s interactive student and teacher demo: classroom banking, budget assignments, credit learning, and encouragement. Help build the next chapter of financial education."};
export default function Home(){return <LandingExperience/>;}
