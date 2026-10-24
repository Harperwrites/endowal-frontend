import endowal from "@/config/clients/endowal.json";
import exampleSchool from "@/config/clients/example-school.json";
export type ClientConfig=Omit<typeof endowal,"introVideo"> & {introVideo:string|null};
const profiles:Record<string,ClientConfig>={endowal,"example-school":exampleSchool};
export function resolveClient(id:string):ClientConfig {
 const config=profiles[id];
 if(!config)throw new Error(`Unknown client profile: ${id}. Register it in lib/client-config.ts.`);
 for(const value of Object.values(config.theme))if(!/^#[0-9a-f]{6}$/i.test(value))throw new Error("Client theme colors must be six-digit hex values");
 if(!config.logo.startsWith("/")||config.logo.startsWith("//"))throw new Error("Use a local /public logo path");
 if(config.introVideo&&(!config.introVideo.startsWith("/")||config.introVideo.startsWith("//")))throw new Error("Use a local /public intro video path");
 return config;
}
export const client=resolveClient(process.env.NEXT_PUBLIC_CLIENT_ID||"endowal");
export const roleLabel=(role:string)=>role==="student"?client.labels.student:role==="teacher"?client.labels.teacher:role;

export const clientStorageKey=(name:string)=>client.id==="endowal"?((name.startsWith("credit-lessons-")||name.startsWith("dashboard-"))?`endowal-${name}`:`endowal_${name}`):`endowal_${client.id}_${name}`;
