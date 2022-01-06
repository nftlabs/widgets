import { defaultChains, defaultL2Chains } from "wagmi";

export const ChainIDToRPCMap: Record<number, string> = {
  1: "mainnet",
  4: "rinkeby",
  137: "https://polygon-rpc.com",
  250: "https://rpc.ftm.tools",
  43114: "https://api.avax.network/ext/bc/C/rpc",
  80001: "https://rpc-mumbai.maticvigil.com",
};

export const ChainIDToNativeSymbol: Record<number, string> = {
  1: "ETH",
  4: "ETH",
  137: "MATIC",
  250: "FTM",
  43114: "AVAX",
  80001: "MATIC",
};

export enum ChainId {
  Mainnet = 1,
  Ropsten = 3,
  Rinkeby = 4,
  Goerli = 5,
  Kovan = 42,
  BSC = 56,
  xDai = 100,
  Polygon = 137,
  Moonriver = 1285,
  Mumbai = 80001,
  Harmony = 1666600000,
  Localhost = 1337,
  Hardhat = 31337,
  Fantom = 250,
  FantomTestnet = 4002,
  Avalanche = 43114,
  AvalancheFujiTestnet = 43113,
}
export const SUPPORTED_CHAIN_IDS = [
  ChainId.Mainnet,
  ChainId.Rinkeby,
  ChainId.Mumbai,
  ChainId.Polygon,
  ChainId.Fantom,
  ChainId.FantomTestnet,
  ChainId.Avalanche,
  ChainId.AvalancheFujiTestnet,
];

export const supportedChains = defaultChains
  .concat(defaultL2Chains)
  .filter((c) => SUPPORTED_CHAIN_IDS.includes(c.id));

console.log("*** supportedChains", supportedChains);
