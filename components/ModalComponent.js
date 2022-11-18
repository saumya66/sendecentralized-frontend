import {
    Box,
    Button,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
} from "@chakra-ui/react"
import styles from "../styles/Home.module.css"

const ModalComponent = ({ isOpen, onClose, content,title }) => {
    return (
        <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose} color={"white"}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <div className={styles.h2}>{title}</div>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>{content}</ModalBody>
            </ModalContent>
        </Modal>
    )
}

export default ModalComponent
