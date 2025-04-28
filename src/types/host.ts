import { Image } from "./image";

export interface Host {
  id: number;
  name: string;
  ip?: string;
  primac?: string;
  imageID?: number;       // ID of assigned image
  imagename?: string;     // Name of assigned image
  image?: Image;
  

  createdTime?: string;
  deployed?: string;

  pingstatuscode?: number;
  pingstatustext?: string;
  pingstatus?: string;

  // Add more if/when needed
}
