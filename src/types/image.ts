export interface OS {
    id: number;
    name: string;
    description?: string;
  }
  
 export interface ImageType {
    id: number;
    name: string;
    type?: string;
  }
  
 export interface ImagePartitionType {
    id: number;
    name: string;
    type?: string;
  }
  
 export interface Image {
    id: number;
    name: string;
    description?: string;
    createdTime: string;
    createdBy: string;
    os?: OS; // Embedded OS object
    imageTypeID?: number;
    imagePartitionTypeID?: number;
    isEnabled?: boolean;
    toReplicate?: boolean;
    deployed?: string;
    osname?: string;
    imagetypename?: string;
    imageparttypename?: string;
  }
  