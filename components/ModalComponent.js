const { Input, Modal } = require("web3uikit")
import styles from "../styles/Home.module.css"

const ModalComponent = (isVisible) => {
    return (
        <Modal
            isCentered
            hasCancel={false}
            hasFooter={false}
            isVisible
            width="50rem"
            onCloseButtonPressed={function noRefCheck() {}}
        >
            <div
                style={{
                    padding: "20px",
                    backgroundColor: "yellow",
                }}
            >
                <div className={styles.h2}>
                    To use the app please change the chain to one of the following 👇
                </div>
            </div>
        </Modal>
    )
}

export default ModalComponent
