export interface Group {
    id: number;
    name: string;
    description?: string;
    createdBy?: string;
    createdTime?: string;
    kernelDevice?: string; // this is "primary disk"
    members?: number;
  }