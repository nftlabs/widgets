import {
  Button,
  Center,
  ChakraProvider,
  Flex,
  Grid,
  Heading,
  Icon,
  Image,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Spinner,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { css, Global } from "@emotion/react";
import {
  ThirdwebProvider,
  useActiveClaimCondition,
  useAddress,
  useChainId,
  useClaimIneligibilityReasons,
  useClaimToken,
  useContractMetadata,
  useTokenDrop,
} from "@thirdweb-dev/react";
import { IpfsStorage, TokenDrop } from "@thirdweb-dev/sdk";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import React, { useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { IoDiamondOutline } from "react-icons/io5";
import { QueryClient, QueryClientProvider } from "react-query";
import { ConnectWalletButton } from "../shared/connect-wallet-button";
import { ConnectedWallet } from "../shared/connected-wallet";
import { Footer } from "../shared/footer";
import { DropSvg } from "../shared/svg/drop";
import chakraTheme from "../shared/theme";
import { fontsizeCss } from "../shared/theme/typography";
import { parseIneligibility } from "../utils/parseIneligibility";
import { parseIpfsGateway } from "../utils/parseIpfsGateway";

interface TokenDropEmbedProps {
  colorScheme?: "light" | "dark";
  contractAddress: string;
  expectedChainId: number;
}
interface ClaimPageProps {
  contract?: TokenDrop;
  expectedChainId: number;
}

const ClaimButton: React.FC<ClaimPageProps> = ({
  contract,
  expectedChainId,
}) => {
  const address = useAddress();
  const chainId = useChainId();
  const [quantity, setQuantity] = useState(1);
  const loaded = useRef(false);
  const activeClaimCondition = useActiveClaimCondition(contract);

  const claimIneligibilityReasons = useClaimIneligibilityReasons(contract, {
    quantity,
    walletAddress: address,
  });

  const isEnabled = !!contract && !!address && chainId === expectedChainId;
  const claimMutation = useClaimToken(contract);

  const bnPrice = parseUnits(
    activeClaimCondition.data?.currencyMetadata.displayValue || "0",
    activeClaimCondition.data?.currencyMetadata.decimals,
  );

  const priceToMint = bnPrice.mul(quantity);

  const isSoldOut =
    activeClaimCondition.data &&
    parseInt(activeClaimCondition.data?.availableSupply) === 0;

  const toast = useToast();

  const claim = async () => {
    claimMutation.mutate(
      { to: address as string, amount: quantity },
      {
        onSuccess: () => {
          toast({
            title: "Successfully claimed.",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
        },
        onError: (err) => {
          console.error(err);
          toast({
            title: "Failed to claim drop.",
            status: "error",
            duration: 9000,
            isClosable: true,
          });
        },
      },
    );
  };

  const isLoading = claimIneligibilityReasons.isLoading && !loaded.current;

  const canClaim =
    !isSoldOut && !!address && !claimIneligibilityReasons.data?.length;

  if (!isEnabled) {
    return <ConnectWalletButton expectedChainId={expectedChainId} />;
  }

  const maxQuantity = activeClaimCondition.data?.maxQuantity;
  const currentMintSupply = activeClaimCondition.data?.currentMintSupply;
  const availableSupply = activeClaimCondition.data?.availableSupply;

  return (
    <Stack spacing={4} align="center" w="100%">
      <Flex w="100%" direction={{ base: "column", md: "row" }} gap={2}>
        <NumberInput
          inputMode="numeric"
          value={quantity}
          onChange={(stringValue, value) => {
            if (stringValue === "") {
              setQuantity(1);
            } else {
              setQuantity(value);
            }
          }}
          min={1}
          max={
            maxQuantity === "unlimited"
              ? undefined
              : parseInt(availableSupply || "1")
          }
          maxW={{ base: "100%", md: "100px" }}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        <Button
          isLoading={isLoading || claimMutation.isLoading}
          isDisabled={!canClaim}
          leftIcon={<IoDiamondOutline />}
          onClick={claim}
          w="full"
          colorScheme="blue"
          fontSize={{ base: "label.md", md: "label.lg" }}
        >
          {isSoldOut
            ? "Sold out"
            : canClaim
            ? `Mint ${quantity}${
                activeClaimCondition.data?.price.eq(0)
                  ? " (Free)"
                  : activeClaimCondition.data?.currencyMetadata.displayValue
                  ? ` (${formatUnits(
                      priceToMint,
                      activeClaimCondition.data.currencyMetadata.decimals,
                    )} ${activeClaimCondition.data?.currencyMetadata.symbol})`
                  : ""
              }`
            : claimIneligibilityReasons.data?.length
            ? parseIneligibility(claimIneligibilityReasons.data, quantity)
            : "Minting Unavailable"}
        </Button>
      </Flex>
      {activeClaimCondition.data && (
        <Text size="label.md" color="green.800">
          {`${currentMintSupply || 0} ${
            maxQuantity !== "unlimited" ? `/ ${maxQuantity || 0}` : ""
          } claimed`}
        </Text>
      )}
    </Stack>
  );
};

const ClaimPage: React.FC<ClaimPageProps> = ({ contract, expectedChainId }) => {
  /*   const tokenMetadata = useEditionToken(contract, tokenId); */
  const tokenMetadata = useContractMetadata(contract?.getAddress());

  if (tokenMetadata.isLoading) {
    return (
      <Center w="100%" h="100%">
        <Stack direction="row" align="center">
          <Spinner />
          <Heading size="label.sm">Loading...</Heading>
        </Stack>
      </Center>
    );
  }

  return (
    <Center w="100%" h="100%">
      <Flex direction="column" align="center" gap={4} w="100%">
        <Grid
          bg="#F2F0FF"
          border="1px solid rgba(0,0,0,.1)"
          borderRadius="20px"
          w="178px"
          h="178px"
          placeContent="center"
          overflow="hidden"
        >
          {tokenMetadata?.data?.image ? (
            <Image
              objectFit="contain"
              w="100%"
              h="100%"
              src={tokenMetadata?.data?.image}
              alt={tokenMetadata?.data?.name}
            />
          ) : (
            <Icon maxW="100%" maxH="100%" as={DropSvg} />
          )}
        </Grid>
        <Heading size="display.md" fontWeight="title" as="h1">
          {tokenMetadata?.data?.name}
        </Heading>
        {tokenMetadata?.data?.description && (
          <Heading noOfLines={2} as="h2" size="subtitle.md">
            {tokenMetadata.data?.description}
          </Heading>
        )}
        <ClaimButton contract={contract} expectedChainId={expectedChainId} />
      </Flex>
    </Center>
  );
};

interface BodyProps {
  children?: React.ReactNode;
}

const Body: React.FC<BodyProps> = ({ children }) => {
  return (
    <Flex as="main" px="28px" w="100%" flexGrow={1}>
      {children}
    </Flex>
  );
};

interface TokenDropEmbedProps {
  colorScheme?: "light" | "dark";
  contractAddress: string;
  expectedChainId: number;
}

const TokenDropEmbed: React.FC<TokenDropEmbedProps> = ({
  contractAddress,
  expectedChainId,
}) => {
  const tokenDrop = useTokenDrop(contractAddress);
  const activeClaimCondition = useActiveClaimCondition(tokenDrop);
  const tokenAddress = activeClaimCondition?.data?.currencyAddress;

  return (
    <Flex
      position="fixed"
      top={0}
      left={0}
      bottom={0}
      right={0}
      flexDir="column"
      borderRadius="1rem"
      overflow="hidden"
      shadow="0px 1px 1px rgba(0,0,0,0.1)"
      border="1px solid"
      borderColor="blackAlpha.100"
      bg="white"
    >
      <Stack
        as="header"
        px="28px"
        direction="row"
        spacing="20px"
        w="100%"
        flexGrow={0}
        borderBottom="1px solid rgba(0,0,0,.1)"
        justify="flex-end"
        py={2}
      >
        <ConnectedWallet tokenAddress={tokenAddress} />
      </Stack>
      <Body>
        <ClaimPage contract={tokenDrop} expectedChainId={expectedChainId} />
      </Body>
      <Footer />
    </Flex>
  );
};

const queryClient = new QueryClient();
const urlParams = new URL(window.location.toString()).searchParams;

const App: React.FC = () => {
  const expectedChainId = Number(urlParams.get("chainId"));
  const contractAddress = urlParams.get("contract") || "";
  const rpcUrl = urlParams.get("rpcUrl") || "";
  const relayerUrl = urlParams.get("relayUrl") || "";

  const ipfsGateway = parseIpfsGateway(urlParams.get("ipfsGateway") || "");

  const sdkOptions = useMemo(
    () =>
      relayerUrl
        ? {
            gasless: {
              openzeppelin: { relayerUrl },
            },
          }
        : undefined,
    [relayerUrl],
  );

  return (
    <>
      <Global
        styles={css`
          :host,
          :root {
            ${fontsizeCss};
          }
        `}
      />
      <QueryClientProvider client={queryClient}>
        <ChakraProvider theme={chakraTheme}>
          <ThirdwebProvider
            desiredChainId={expectedChainId}
            sdkOptions={sdkOptions}
            storageInterface={
              ipfsGateway ? new IpfsStorage(ipfsGateway) : undefined
            }
            chainRpc={{ [expectedChainId]: rpcUrl }}
          >
            <TokenDropEmbed
              contractAddress={contractAddress}
              expectedChainId={expectedChainId}
            />
          </ThirdwebProvider>
        </ChakraProvider>
      </QueryClientProvider>
    </>
  );
};

const container = document.getElementById("root") as Element;
const root = createRoot(container);
root.render(<App />);
