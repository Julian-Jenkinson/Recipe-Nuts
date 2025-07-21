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

export function PrivacyPolicyModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalBackdrop />
      <ModalContent style={{ maxHeight: "80%" }}>
        <ModalHeader>
          <Heading style={styles.heading}>
            Privacy Policy
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
            We respect your privacy.
          </Text>
          <Text style={styles.text}>
            This app stores recipes you save on your device.
          </Text>
          <Text style={styles.text}>
            No personal data is shared with third parties.
          </Text>
          <Text style={styles.text}>
            We do not track your activity or use analytics services.  
          </Text>
          <Text style={styles.text}>
            If you contact us, we only use your email to respond.  
          </Text>
          <Text style={styles.text}>
            You may delete the app at any time to remove stored data.
          </Text>
          
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
  }
});