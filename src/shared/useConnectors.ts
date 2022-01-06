import { useMemo } from "react";
import {
  InjectedConnector,
  WalletConnectConnector,
  WalletLinkConnector,
} from "wagmi";
import { ChainIDToRPCMap, supportedChains } from "../shared/commonRPCUrls";

export function useConnectors(expextedChainId: number, rpcUrl?: string) {
  return useMemo(
    () => [
      new InjectedConnector({
        chains: supportedChains.filter((c) => c.id === expextedChainId),
      }),
      new WalletConnectConnector({
        chains: supportedChains.filter((c) => c.id === expextedChainId),
        options: {
          qrcode: true,
          rpc: rpcUrl ? { [expextedChainId]: rpcUrl } : ChainIDToRPCMap,
          chainId: expextedChainId,
          clientMeta: {
            name: "thirdweb - embed",
            description: "thirdweb - embed",
            icons: ["https://thirdweb.com/favicon.ico"],
            url: "https://thirdweb.com",
          },
        },
      }),
      new WalletLinkConnector({
        chains: supportedChains.filter((c) => c.id === expextedChainId),
        options: {
          appName: "thirdweb - embed",
          appLogoUrl: "https://thirdweb.com/favicon.ico",
          darkMode: false,
          jsonRpcUrl: rpcUrl || ChainIDToRPCMap[expextedChainId],
        },
      }),
    ],
    [expextedChainId],
  );
}
