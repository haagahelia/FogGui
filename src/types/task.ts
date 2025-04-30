import { Host } from './host';
import { Image } from './image';

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
