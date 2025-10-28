
export interface Device {
  id: string;
  name: string;
  type: 'light' | 'aircon' | 'vacuum' | 'kettle' | 'blinds';
  status: boolean; // on or off
  value?: number; // temperature for aircon, level for blinds
}

export type Devices = {
  [key: string]: Device;
};
