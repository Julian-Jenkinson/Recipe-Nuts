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
      <ModalContent>
        <ModalHeader>
          <Heading size="md" className="text-typography-950">
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
          <Text size="sm" className="text-typography-500">
            We respect your privacy.  
            This app stores recipes you save on your device.  
            No personal data is shared with third parties.  
            We do not track your activity or use analytics services.  
            If you contact us, we only use your email to respond.  
            You may delete the app at any time to remove stored data.  
          </Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
