import Head from "next/head"
import styles from "../styles/Home.module.css"
import LotteryEntrance from "../components/SendContract"
import { useMoralis } from "react-moralis"
import { ConnectButton } from "web3uikit"
import ModalComponent from "../components/ModalComponent"
import { useEffect, useState } from "react"
import { Box, Button } from "@chakra-ui/react"

const supportedChains = ["31337", "80001", "5"]
const networks = {
    polygon_mumbai: {
        chainId: `0x${Number(80001).toString(16)}`,
        chainName: "Polygon Mumbai",
        nativeCurrency: {
            name: "MATIC",
            symbol: "MATIC",
            decimals: 18,
        },
        rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
        blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
    },
    goerli: {
        chainId: `0x${Number(5).toString(16)}`,
        // chainName: "Goerli",
        // nativeCurrency: {
        //     name: "GoerliETH",
        //     symbol: "GoerliETH",
        //     decimals: 18,
        // },
        // rpcUrls: ["https://goerli.infura.io/v3/"],
        // blockExplorerUrls: ["https://goerli.etherscan.io"],
    },
}

export default function Home() {
    const { isWeb3Enabled, chainId } = useMoralis()

    const [error, setError] = useState()
    const [isSwitchChainModalOpen, setIsSwitchChainModalOpen] = useState()

    const networkChanged = (chainId) => {
        console.log(`Current ChainId : ${chainId}`)
    }

    const changeNetwork = async (networkName) => {
        try {
            if (!window.ethereum) throw new Error("No Wallet found")
            //switching the chain here
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [
                    {
                        chainId: networks[networkName].chainId,
                    },
                ],
            })
        } catch (err) {
            //adding the chain here
            if (err.code == 4902) {
                await window.ethereum.request({
                    method: "wallet_addEthereumChain",
                    params: [
                        {
                            ...networks[networkName],
                        },
                    ],
                })
            }
            console.log(err)
        }
    }

    const onClose = () => {
        setIsSwitchChainModalOpen(false)
    }

    useEffect(() => {
        window.ethereum.on("chainChanged", networkChanged)
        supportedChains.includes(parseInt(chainId).toString())
            ? setIsSwitchChainModalOpen(false)
            : setIsSwitchChainModalOpen(true)
        return () => {
            window.ethereum.removeListener("chainChanged", networkChanged)
        }
    }, [])
    return (
        <div className={styles.container}>
            <Head>
                <title>Sendecentralized</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <nav className={styles.header}>
                <h1 className={styles.h1}>Sendecentralized</h1>
                <div className="ml-auto py-2 px-4">
                    <ConnectButton moralisAuth={false} />
                </div>
            </nav>

            {isWeb3Enabled ? (
                <div>
                    {supportedChains.includes(parseInt(chainId).toString()) ? (
                        <div className="flex flex-row">
                            <LotteryEntrance className="p-8" />
                        </div>
                    ) : (
                        <>
                            <ModalComponent
                                isOpen={isSwitchChainModalOpen}
                                onClose={onClose}
                                content={
                                    <>
                                        <div className={styles.h3}>
                                            To use the app please change the chain to one of the
                                            following 👇
                                        </div>
                                        <Box
                                            display="flex"
                                            align="center"
                                            justifyContent="space-between"
                                            direction="row"
                                        >
                                            <Button
                                                variant="ghost"
                                                w="45%"
                                                onClick={() => changeNetwork("polygon_mumbai")}
                                            >
                                                <div className={styles.h3}>Polygon Mumbai</div>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                w="45%"
                                                onClick={() => changeNetwork("goerli")}
                                            >
                                                <div className={styles.h3}>Goerli</div>
                                            </Button>
                                        </Box>
                                    </>
                                }
                            />
                        </>
                    )}
                </div>
            ) : (
                <div>Please connect to a Wallet</div>
            )}
        </div>
    )
}
