import { HttpAgent } from "@icp-sdk/core/agent";
import { useCallback, useState } from "react";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";
import { useInternetIdentity } from "./useInternetIdentity";

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

export function useImageUpload() {
  const { identity } = useInternetIdentity();
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  const uploadImage = useCallback(
    async (file: File): Promise<string | null> => {
      setState({ isUploading: true, progress: 0, error: null });
      try {
        const config = await loadConfig();

        if (
          !config.storage_gateway_url ||
          config.storage_gateway_url === "nogateway"
        ) {
          // Fallback: use local object URL for preview only
          setState({ isUploading: false, progress: 100, error: null });
          return URL.createObjectURL(file);
        }

        const agentOptions: Record<string, unknown> = {
          host: config.backend_host,
        };
        if (identity) {
          agentOptions.identity = identity;
        }
        const agent = new HttpAgent(agentOptions);
        if (config.backend_host?.includes("localhost")) {
          await agent.fetchRootKey().catch(() => {});
        }

        const storageClient = new StorageClient(
          config.bucket_name,
          config.storage_gateway_url,
          config.backend_canister_id,
          config.project_id,
          agent,
        );

        const bytes = new Uint8Array(await file.arrayBuffer());
        const { hash } = await storageClient.putFile(bytes, (pct) => {
          setState((p) => ({ ...p, progress: pct }));
        });

        const url = await storageClient.getDirectURL(hash);
        setState({ isUploading: false, progress: 100, error: null });
        return url;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        setState({ isUploading: false, progress: 0, error: msg });
        // Fallback to object URL
        return URL.createObjectURL(file);
      }
    },
    [identity],
  );

  return { ...state, uploadImage };
}
