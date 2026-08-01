import type { Json } from "@/types/database";
export function maskSensitiveDestination(method:string,destination:Json){
 if(!destination||Array.isArray(destination)||typeof destination!=="object")return "—";
 const raw=method==="bitcoin"?destination.bitcoin_address:destination.account_number;
 return typeof raw==="string"&&raw.trim()?`•••• ${raw.replace(/\s/g,"").slice(-4)}`:"—";
}
