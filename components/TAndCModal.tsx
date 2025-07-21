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

export function TAndCModal({
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
          <Text size="sm" className="text-typography-500">
            By using this app you agree to these terms:
            1. You may use this app for personal, non-commercial purposes only.
            2. We are not responsible for any data loss or damages caused by using this app.
            3. Features may change without notice.
            4. These terms may be updated occasionally.

            If you do not agree with these terms, please discontinue using the app.

          </Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
