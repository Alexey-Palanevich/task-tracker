import { create } from 'zustand';

interface SshCredentials {
  host: string;
  port: number;
  username: string;
  keyPath: string;
  domain: string;
}

interface DeployState {
  step: 'form' | 'deploying' | 'complete';
  currentStep: string;
  credentials: SshCredentials | null;
  error: string | null;
  setCredentials: (creds: SshCredentials) => void;
  setCurrentStep: (step: string) => void;
  setError: (error: string) => void;
  startDeployment: () => void;
}

export const useDeployStore = create<DeployState>((set) => ({
  step: 'form',
  currentStep: 'connecting',
  credentials: null,
  error: null,
  setCredentials: (creds) => set({ credentials: creds }),
  setCurrentStep: (step) => set({ currentStep: step }),
  setError: (error) => set({ error }),
  startDeployment: () => set({ step: 'deploying', currentStep: 'connecting', error: null }),
}));
