import { contextBridge } from 'electron';

export interface ElectronAPI {
  platform: NodeJS.Platform;
}

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
} satisfies ElectronAPI);