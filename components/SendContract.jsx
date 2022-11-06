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
import { Button, BeatLoader, ButtonGroup, Input } from "@chakra-ui/react"
import { useDropzone } from "react-dropzone"

export default function SendContract() {
    const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis()
    // These get re-rendered every time due to our connect button!
    const chainId = parseInt(chainIdHex)
    // console.log(`ChainId is ${chainId}`)
    const sendContractAddress = chainId in contractAddresses ? contractAddresses[chainId] : null
    const dispatch = useNotification()

    const onDrop = useCallback((acceptedFiles) => {
        console.log(acceptedFiles)
        setFileImg(acceptedFiles[0])
    }, [])
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })
    // draggableFileArea.addEventListener("drop", (e) => {
    //     console.log("File Dropped Successfully!")
    //     setFileImg(
    //         e.target.files[0].name + " " + (e.target.files[0].size / 1024).toFixed(1) + " KB"
    //     )
    //     console.log(
    //         e.target.files[0].name + " " + (e.target.files[0].size / 1024).toFixed(1) + " KB"
    //     )
    //     // let files = e.dataTransfer.files;
    //     // fileInput.files = files;
    //     console.log(document.querySelector(".default-file-input").value)
    //     // fileName.innerHTML = files[0].name;
    //     // fileSize.innerHTML = (files[0].size/1024).toFixed(1) + " KB";
    //     // uploadedFile.style.cssText = "display: flex;";
    //     // progressBar.style.width = 0;
    //     // fileFlag = 0;
    // })

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
    const [animate, setAnimate] = useState(false)

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
        let transactionReceipt
        try {
            transactionReceipt = await transaction.wait(1)
        } catch (err) {
            console.log("F : ", err)
        }
        setRetrievedFileHash(transactionReceipt.events[0].args.fileHash)
        setIsLoading(false)
    }
    // const {
    //     runContractFunction: uploadedFile,
    //     isLoading: isUploading,
    //     isFetching: isFetchingUploading,
    // } = useWeb3Contract({
    //     abi: abi,
    //     contractAddress: sendContractAddress,
    //     functionName: "uploadedFile",
    //     gasLimit: 2500000,
    //     // msgValue: entranceFee,
    //     params: { ipfsFileHash: ipfsFileHash?.toString() },
    // })

    // const {
    //     runContractFunction: getFile,
    //     isLoading: isGettingFile,
    //     isFetching: isFetchingGettingFile,
    // } = useWeb3Contract({
    //     abi: abi,
    //     contractAddress: sendContractAddress,
    //     functionName: "getFile",
    //     // msgValue: entranceFee,
    //     params: { randNum: code?.toString() },
    // })

    /* View Functions */
    // const { runContractFunction: getRandomNum } = useWeb3Contract({
    //     abi: abi,
    //     contractAddress: sendContractAddress,
    //     functionName: "getRandomNum",
    //     params: {},
    // })

    const handleNewNotification = (message) => {
        dispatch({
            type: "info",
            message: message,
            title: "Transaction Complete!",
            position: "topR",
            icon: "bell",
        })
    }

    const sendFileToIPFS = async (e) => {
        e.preventDefault()
        setIsUploading(true)
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
                        pinata_api_key: `${process.env.PINATA_API_KEY}`,
                        pinata_secret_api_key: `${process.env.PINATA_API_SECRET}`,
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
        // console.log(ipfsFileHash)
        const send = async function () {
            try {
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
                    handleNewNotification("Generated Code")
                    setIsGettingCode(false)
                })

                const transaction = await contract.uploadedFile(ipfsFileHash, {
                    gasLimit: 2500000,
                })
                handleNewNotification("Transaction Complete, generating code... ")
                await transaction.wait(1)
            } catch (e) {
                console.log("Error : " + e)
                setIsGettingCode(false)
            }
        }
        ipfsFileHash && send()
    }, [ipfsFileHash])

    const [action, setAction] = useState("send")

    const changeActionType = (e) => {
        e.preventDefault()
        console.log("styles.card")
    }
    return (
        <>
            {sendContractAddress ? (
                <div
                    className={isSendActive ? styles.card : styles.cardMoves}
                    // style={{ transform: "rotateY(180deg)", transition: "transform 0.5s" }}
                    // onMouseEnter={() => changeActionType}
                    // onMouseLeave={() => setIsShown(false)}
                >
                    <div className={styles.content}>
                        {/* {ipfsFileHash && (
                            <>
                                <p>This image is stored on IPFS & The Ethereum Blockchain!</p>
                                <img src={`https://ipfs.io/ipfs/${ipfsFileHash}`} alt="" />
                            </>
                            
                        )} */}
                        <div className={styles.sendContainer}>
                            <form encType="multipart/form-data">
                                {/* <div className={styles.uploadFilesContainer}> */}
                                {fileImg ? (
                                    <div className={styles.dragFileArea}>
                                        <Lottie
                                            options={uploadedAnimationdefaultOptions}
                                            height={200}
                                            width={200}
                                        />
                                        <div className={styles.fileBlock}>
                                            <p className={styles.fileName}>
                                                {`${fileImg.name} | ${(
                                                    fileImg.size / 1024
                                                ).toFixed(1)}KB`}
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
                                            <span className={styles.browseFilesText}>
                                                browse
                                            </span>{" "}
                                            file from device
                                        </p>
                                        {/* <label className={styles.label}>
                                                <span className={styles.browseFiles}>

                                                </span>{" "}
                                            </label> */}
                                    </div>
                                )}
                                <div className={styles.sendButtonContainer}>
                                    {fileImg ? (
                                        <Button
                                            onClick={sendFileToIPFS}
                                            type="submit"
                                            colorScheme="purple"
                                            borderRadius="40px"
                                            w="50%"
                                            isLoading={isGettingCode}
                                        >
                                            {generatedCode ? generatedCode : "Send"}
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={sendFileToIPFS}
                                            colorScheme="purple"
                                            borderRadius="40px"
                                            w="50%"
                                            isLoading={isUploading}
                                            isDisabled={fileImg ? false : true}
                                        >
                                            Upload
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </div>
                        <div className={styles.receiveContainer}>
                            <div>
                                <Input
                                    // placeholder="Code"
                                    size="md"
                                    onChange={(e) => setCode(e.target.value)}
                                />
                                {retrievedFileHash ? (
                                    <a href={`https://ipfs.io/ipfs/${ipfsFileHash}`} download>
                                        File
                                    </a>
                                ) : (
                                    <Button
                                        colorScheme="purple"
                                        borderRadius="40px"
                                        w="50%"
                                        mt="16px"
                                        onClick={retrieve}
                                        disabled={isLoading}
                                    >
                                        Get File
                                    </Button>
                                )}
                            </div>
                            {/* <div>{`The file hash is : ${fileHash}`}</div> */}
                        </div>
                    </div>
                </div>
            ) : (
                // <div className={styles.card}>
                //     <div className={styles.content}>
                //         <div className={styles.front}>Front</div>
                //         <div className={styles.back}>Back!</div>
                //     </div>
                // </div>
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
                    Send
                </Button>
                <Button
                    onClick={() => setIsSendActive(false)}
                    h="100%"
                    w="50%"
                    variant="unstyled"
                    isDisabled={!isSendActive}
                >
                    Receive
                </Button>
            </div>
        </>
    )
}
