import { Host } from "./host";
import { Image } from "./image";

export interface Task {
  id: number;
  name: string;
  hostID: number;
  stateID: number;
  typeID: number;
  imageID: number;
  storagegroupID: number;
  storagenodeID: number;

  createdTime: string;
  scheduledStartTime?: string;
  checkInTime?: string;
  percent?: string;
  timeElapsed?: string;
  timeRemaining?: string;

  host?: Host;
  image?: Image;
  type?: {
    id: number;
    name: string;
    description: string;
  };
  state?: {
    id: number;
    name: string;
    description: string;
  };
}

export interface ActiveTask {
  id: number;
  DT_RowId: string;
  name: string;
  mainlink: string;
  checkInTime: string | "No Data";
  hostID: number;
  hostLink: string | null;
  stateID: number;
  createdTime: string; // ISO format or YYYY-MM-DD HH:mm:ss
  createdBy: string;
  isForced: string | boolean;
  scheduledStartTime: string | "No Data";
  typeID: number;
  pct: string; // FOG often sends "0000000000" as a string
  bpm: string;
  timeElapsed: string;
  timeRemaining: string;
  dataCopied: string;
  percent: string;
  dataTotal: string;
  storagegroupID: number;
  storagegroupLink: string | null;
  storagenodeID: number;
  storagenodeLink: string | null;
  NFSFailures: string;
  NFSLastMemberID: number;
  shutdown: string | boolean;
  passreset: string;
  isDebug: number; // Binary 0 or 1
  imageID: number;
  imageLink: string | null;
  wol: string;
  bypassbitlocker: string;
}
