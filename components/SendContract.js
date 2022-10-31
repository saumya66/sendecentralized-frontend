import { contractAddresses, abi } from "../constants"
// dont export from moralis when using react
import { useMoralis, useWeb3Contract } from "react-moralis"
import { useEffect, useState } from "react"
import { Input, useNotification } from "web3uikit"
import ipfs from "../ipfs"
import axios from "axios"
// import { ethers } from "ethers"

export default function SendContract() {
    const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis()
    // These get re-rendered every time due to our connect button!
    const chainId = parseInt(chainIdHex)
    // console.log(`ChainId is ${chainId}`)
    const sendContractAddress = chainId in contractAddresses ? contractAddresses[chainId] : null
    const dispatch = useNotification()

    const [ipfsFileHash, setIpfsFileHash] = useState()
    const [generatedCode, setGeneratedCode] = useState()
    const [fileBuffer, setFileBuffer] = useState()

    const [code, setCode] = useState()
    const [fileHash, setFileHash] = useState()
    const [isLoading, setIsLoading] = useState(false)

    const [fileImg, setFileImg] = useState(null)

    const send = async function () {
        setIsLoading(true)
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
            handleNewNotification()
            setIsLoading(false)
        })

        const transaction = await contract.uploadedFile(ipfsFileHash, {
            gasLimit: 2500000,
        })
        await transaction.wait(1)
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
        console.log("T : ", transaction)
        let transactionReceipt
        try {
            transactionReceipt = await transaction.wait(1)
        } catch (err) {
            console.log("F : ", err)
        }
        setFileHash(transactionReceipt.events[0].args.fileHash)
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

    const handleNewNotification = () => {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Transaction Notification",
            position: "topR",
            icon: "bell",
        })
    }

    const handleSuccess = async (tx) => {
        try {
            handleNewNotification(tx)
        } catch (error) {
            console.log(error)
        }
    }

    // function captureFile(event) {
    //     event.preventDefault()
    //     const file = event.target.files[0]
    //     const reader = new window.FileReader()
    //     reader.readAsArrayBuffer(file)
    //     reader.onloadend = () => {
    //         setFileBuffer(Buffer(reader.result))
    //         console.log("buffer", fileBuffer)
    //     }
    // }

    // function onSubmit(event) {
    //     event.preventDefault()
    //     ipfs.files.add(fileBuffer, (error, result) => {
    //         if (error) {
    //             console.error(error)
    //             return
    //         }
    //         setIpfsFileHash(result[0].hash)
    //         console.log("ifpsHash", setIpfsFileHash)
    //     })
    // }
    const sendFileToIPFS = async (e) => {
        e.preventDefault()
        console.log(fileImg)
        console.log(process.env.PINATA_API_KEY)
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
                const ImgHash = `ipfs://${resFile.data.IpfsHash}`
                setIpfsFileHash(ImgHash)
                //Take a look at your Pinata Pinned section, you will see a new file added to you list.
            } catch (error) {
                console.log("Error sending File to IPFS: ")
                console.log(error)
            }
        }
    }
    return (
        <div className="p-5">
            <h1 className="py-4 px-4 font-bold text-3xl">Send</h1>
            {sendContractAddress ? (
                <>
                    <div className="m-4">
                        {ipfsFileHash && (
                            <>
                                <p>This image is stored on IPFS & The Ethereum Blockchain!</p>
                                <img src={`https://ipfs.io/ipfs/${ipfsFileHash}`} alt="" />
                            </>
                        )}
                        <h2>Upload</h2>
                        <form onSubmit={sendFileToIPFS}>
                            <input type="file" onChange={(e) => setFileImg(e.target.files[0])} />
                            <button type="submit">Go</button>
                        </form>
                        <Input
                            label="Label text"
                            name="Test text Input"
                            onChange={(e) => setIpfsFileHash(e.target.value)}
                        />
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            onClick={send}
                            // onClick={async () => {
                            //     console.log(ipfsFileHash)
                            //     await uploadedFile({
                            //         // onComplete:
                            //         // onError:
                            //         onSuccess: handleSuccess,
                            //         onError: (error) => console.log(error),
                            //     })
                            //     let code = await getRandomNum()
                            //     setGeneratedCode(code)
                            // }}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                            ) : (
                                "Send File"
                            )}
                        </button>
                        <div>{`The generated Code is : ${generatedCode}`}</div>
                    </div>
                    <div className="m-4">
                        <Input
                            label="Label text"
                            name="Test text Input"
                            onChange={(e) => setCode(e.target.value)}
                        />
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            onClick={retrieve}
                            // onClick={async () => {
                            //     console.log(code)
                            //     let txResponse = await getFile({
                            //         // onComplete:
                            //         // onError:
                            //         onSuccess: (tx) =>
                            //             tx.wait().then((finalTx) => {
                            //                 console.log(
                            //                     "File Hash : ",
                            //                     finalTx.events[0].args.fileHash
                            //                 )
                            //             }),
                            //         onError: (error) => console.log(error),
                            //     })
                            //     console.log("a")

                            //     // let fileHash = txReceipt.events[0].args.fileHash
                            //     // console.log("File Hash : ", fileHash)
                            //     // console.log(fileHash.data?.toString())
                            //     // setFileHash(fileHash)
                            // }}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                            ) : (
                                "Get File"
                            )}
                        </button>
                        <div>{`The file hash is : ${fileHash}`}</div>
                    </div>
                </>
            ) : (
                <div>Please connect to a supported chain </div>
            )}
        </div>
    )
}
