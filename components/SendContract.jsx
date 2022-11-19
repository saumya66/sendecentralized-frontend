import { contractAddresses, abi } from "../constants"
// dont export from moralis when using react
import { useMoralis, useWeb3Contract } from "react-moralis"
import { useCallback, useEffect, useState } from "react"
import { useNotification } from "web3uikit"
import axios from "axios"
import styles from "../styles/Send.module.css"
import Lottie from "react-lottie"
import uploadedAnimationData from "../assets/uploaded-animation.json"
import uploadAnimationData from "../assets/upload-animation.json"
import {
    Link,
    Button,
    BeatLoader,
    ButtonGroup,
    Input,
    Box,
    useClipboard,
    useToast,
} from "@chakra-ui/react"
import { useDropzone } from "react-dropzone"

export default function SendContract() {
    const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis()
    // These get re-rendered every time due to our connect button!
    const chainId = parseInt(chainIdHex)
    // console.log(`ChainId is ${chainId}`)
    const sendContractAddress = chainId in contractAddresses ? contractAddresses[chainId] : null
    const dispatch = useNotification()
    const toast = useToast()
    const onDrop = useCallback((acceptedFiles) => {
        console.log(acceptedFiles)
        setFileImg(acceptedFiles[0])
    }, [])
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

    const [ipfsFileHash, setIpfsFileHash] = useState()
    const [generatedCode, setGeneratedCode] = useState()
    const [fileBuffer, setFileBuffer] = useState()

    const [code, setCode] = useState()
    const [retrievedFileHash, setRetrievedFileHash] = useState()
    const [isLoading, setIsLoading] = useState(false)

    const [fileImg, setFileImg] = useState(null)

    const [isUploading, setIsUploading] = useState(false)
    const [isGettingCode, setIsGettingCode] = useState(false)
    const [isGettingFile, setIsGettingFile] = useState(false)

    const [isSendActive, setIsSendActive] = useState(true)

    const { onCopy, value, setValue, hasCopied } = useClipboard("")

    const uploadAnimationdefaultOptions = {
        loop: true,
        autoplay: true,
        animationData: uploadAnimationData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
        },
    }

    const uploadedAnimationdefaultOptions = {
        loop: false,
        autoplay: true,
        animationData: uploadedAnimationData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
        },
    }

    const retrieve = async function () {
        let transactionReceipt
        try {
            setIsLoading(true)
            const address = sendContractAddress
            console.log(code)
            const ethers = Moralis.web3Library
            const web3Provider = await Moralis.enableWeb3()
            const signer = web3Provider.getSigner()
            const contract = new ethers.Contract(address, abi, signer)

            const transaction = await contract.getFile(code?.toString(), {
                gasLimit: 2500000,
            })
            transactionReceipt = await transaction.wait(1)
            setRetrievedFileHash(transactionReceipt.events[0].args.fileHash)
            console.log(transactionReceipt.events[0].args.fileHash)
            handleNewNotification("got the file", "success")
            setIsLoading(false)
        } catch (err) {
            console.log("F : ", err)
            handleNewNotification("file requested once already!", "error")
            setIsLoading(false)
        }
    }

    const handleNewNotification = (message, type) => {
        // dispatch({
        //     type: type,
        //     title: message,
        //     position: "topR",
        //     icon: "bell",
        // })
        toast({
            title: message,
            // description: "We've created your account for you.",
            status: type,
            duration: 9000,
            isClosable: true,
        })
    }

    const openFile = (e) => {
        e.preventDefault()
        console.log("clicked")
        console.log(`https://ipfs.io/ipfs/${ipfsFileHash}`)
        window.open(`https://ipfs.io/ipfs/${ipfsFileHash}`, "_blank")
    }

    const sendFileToIPFS = async (e) => {
        e.preventDefault()
        setIsUploading(true)
        console.log("Uploading file...")
        console.log(fileImg)
        if (fileImg) {
            try {
                const formData = new FormData()
                formData.append("file", fileImg)
                const resFile = await axios({
                    method: "post",
                    url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
                    data: formData,
                    headers: {
                        pinata_api_key: `${process.env.NEXT_PUBLIC_PINATA_API_KEY}`,
                        pinata_secret_api_key: `${process.env.NEXT_PUBLIC_PINATA_API_SECRET}`,
                        "Content-Type": "multipart/form-data",
                    },
                })
                setIpfsFileHash(resFile.data.IpfsHash)
            } catch (error) {
                console.log("Error sending File to IPFS: ")
                console.log(error)
            } finally {
                setIsUploading(false)
            }
        }
    }

    useEffect(() => {
        const send = async function () {
            try {
                console.log("Getting Code...")
                setIsGettingCode(true)
                const address = sendContractAddress
                console.log(address)
                const ethers = Moralis.web3Library
                const web3Provider = await Moralis.enableWeb3()
                const signer = web3Provider.getSigner()
                const contract = new ethers.Contract(address, abi, signer)

                contract.once("RequestFulfilled", async () => {
                    console.log("RequestFulfilled")
                    let code = await contract.getRandomNum()
                    setGeneratedCode(code)
                    setValue(code)
                    handleNewNotification("Generated Code", "success")
                    setIsGettingCode(false)
                })

                const transaction = await contract.uploadedFile(ipfsFileHash, {
                    gasLimit: 2500000,
                })
                handleNewNotification("Generating code... ", "info")
                await transaction.wait(1)
            } catch (e) {
                console.log("Error : " + e)
                setIsGettingCode(false)
            }
        }
        console.log("Uploaded File")
        ipfsFileHash && send()
    }, [ipfsFileHash])

    return (
        <>
            {sendContractAddress ? (
                <div className={isSendActive ? styles.card : styles.cardMoves}>
                    <div className={styles.content}>
                        <div className={styles.sendContainer}>
                            {fileImg ? (
                                <div className={styles.dragFileArea}>
                                    <Lottie
                                        options={uploadedAnimationdefaultOptions}
                                        height={200}
                                        width={200}
                                    />
                                    <div className={styles.fileBlock}>
                                        <p className={styles.fileName}>
                                            {`${fileImg.name} | ${(fileImg.size / 1024).toFixed(
                                                1
                                            )}KB`}
                                        </p>{" "}
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.dragFileArea} {...getRootProps()}>
                                    <input type="file" {...getInputProps()} />{" "}
                                    <Lottie
                                        options={uploadAnimationdefaultOptions}
                                        height={200}
                                        width={200}
                                    />
                                    <p style={{ fontSize: "1rem" }}>
                                        {" "}
                                        Drag & drop any file here or{" "}
                                        <span className={styles.browseFilesText}>browse</span> file
                                        from device
                                    </p>
                                </div>
                            )}
                            <div className={styles.sendButtonContainer}>
                                {generatedCode ? (
                                    <Box
                                        borderRadius="40px"
                                        w="100%"
                                        display="flex"
                                        flexDirection="row"
                                        alignItems="center"
                                        justifyContent="space-between"
                                    >
                                        <Input
                                            w={"70%"}
                                            isReadOnly={true}
                                            value={generatedCode}
                                            // mu={"10px"}
                                            // mr={2}
                                        />
                                        <Button onClick={onCopy} w={"25%"} fontSize="0.8rem">
                                            {hasCopied ? "Copied!" : "Copy"}
                                        </Button>
                                    </Box>
                                ) : (
                                    <Button
                                        onClick={sendFileToIPFS}
                                        colorScheme="purple"
                                        borderRadius="40px"
                                        w="50%"
                                        isDisabled={!fileImg}
                                        isLoading={isGettingCode || isUploading}
                                    >
                                        send
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className={styles.receiveContainer}>
                            <Input
                                placeholder="code"
                                mb="12px"
                                size="md"
                                onChange={(e) => setCode(e.target.value)}
                            />
                            <Button
                                colorScheme="purple"
                                borderRadius="40px"
                                w="50%"
                                mt="16px"
                                onClick={retrievedFileHash ? openFile : retrieve}
                                isLoading={isLoading}
                            >
                                {retrievedFileHash ? "open file" : "get file"}
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div>Please connect to a supported chain </div>
            )}
            <div
                style={{
                    borderRadius: "40px",
                    backgroundColor: "white",
                    height: "60px",
                    width: "100%",
                    marginTop: "20px",
                }}
            >
                <Button
                    h="100%"
                    w="50%"
                    borderRadius="0"
                    borderRightColor={"black"}
                    borderRightWidth="2px"
                    variant="unstyled"
                    isDisabled={isSendActive}
                    onClick={() => setIsSendActive(true)}
                >
                    send
                </Button>
                <Button
                    onClick={() => setIsSendActive(false)}
                    h="100%"
                    w="50%"
                    variant="unstyled"
                    isDisabled={!isSendActive}
                >
                    receive
                </Button>
            </div>
        </>
    )
}
