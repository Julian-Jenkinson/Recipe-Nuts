import {
  CloseIcon,
  Heading,
  Icon,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  Text,
} from "@gluestack-ui/themed";
import React from "react";
import { StyleSheet } from "react-native";
import theme from '../theme';

export function TAndCModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" style={styles.container}>
      <ModalBackdrop />
      <ModalContent style={styles.modalContent}>
        <ModalHeader>
          <Heading style={styles.heading}>
            Terms and Conditions
          </Heading>
          <ModalCloseButton>
            <Icon
              as={CloseIcon}
              size="md"
              className="stroke-background-400 group-[:hover]/modal-close-button:stroke-background-700 group-[:active]/modal-close-button:stroke-background-900 group-[:focus-visible]/modal-close-button:stroke-background-900"
            />
          </ModalCloseButton>
        </ModalHeader>

        <ModalBody>
          <Text style={styles.text}>
            By using this app you agree to these terms:
          </Text>
          <Text style={styles.subtext}>
            <Text style={styles.subtextBold}>1. </Text>You may use this app for personal, non-commercial purposes only.
          </Text>
          <Text style={styles.subtext}>
            <Text style={styles.subtextBold}>2. </Text>We are not responsible for any data loss or damages caused by using this app.
          </Text>
          <Text style={styles.subtext}>
            <Text style={styles.subtextBold}>3. </Text>Features may change without notice.
          </Text>
          <Text style={styles.subtext}>
            <Text style={styles.subtextBold}>4. </Text>These terms may be updated occasionally.
          </Text>
          <Text style={styles.text}>
            If you do not agree with these terms, please discontinue using the app.
          </Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    maxHeight: '80%',
    backgroundColor: theme.colors.bg,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
  },
  heading: {
    fontSize: 20,
    fontFamily: "Nunito-900",
    marginTop: 10,
    marginBottom: 10,
  },
  text: {
    fontSize: 18,
    fontFamily: "Nunito-400",
    paddingTop: 8,
  },
  subtext: {
    fontSize: 18,
    fontFamily: "Nunito-400",
    paddingTop: 8,
    paddingLeft: 16,
  },
  subtextBold: {
    fontSize: 18,
    fontFamily: "Nunito-700",
    paddingTop: 8,
    paddingLeft: 16,
  },
});
