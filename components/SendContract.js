import { contractAddresses, abi } from "../constants"
// dont export from moralis when using react
import { useMoralis, useWeb3Contract } from "react-moralis"
import { useEffect, useState } from "react"
import { Input, useNotification } from "web3uikit"
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

    const [code, setCode] = useState()
    const [fileHash, setFileHash] = useState()
    const [isLoading, setIsLoading] = useState(false)
    const send = async function () {
        setIsLoading(true)
        const address = sendContractAddress
        console.log(address)
        const ethers = Moralis.web3Library
        const web3Provider = await Moralis.enableWeb3()
        const signer = web3Provider.getSigner()
        const contract = new ethers.Contract(address, abi, signer)

        const transaction = await contract.uploadedFile(ipfsFileHash, {
            gasLimit: 2500000,
        })
        await transaction.wait()
        await handleSuccess(transaction)
        let code = await contract.getRandomNum()
        setGeneratedCode(code)
        setIsLoading(false)
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
        try {
            const transactionReceipt = await transaction.wait(1)
        } catch (err) {
            console.log("F : ", err)
        }
        // await transaction.wait(1).then((finalTx) => {
        //     // console.log("File Hash : ", finalTx.events[0].args.fileHash)
        //     // setFileHash(finalTx.events[0].args.fileHash)
        // })
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
            await tx.wait(1)
            handleNewNotification(tx)
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="p-5">
            <h1 className="py-4 px-4 font-bold text-3xl">Send</h1>
            {sendContractAddress ? (
                <>
                    <div className="m-4">
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
