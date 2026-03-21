import React from 'react';
import { Modal as MantineModal, Group, Text } from '@mantine/core';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  titleIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  titleIcon,
  size = 'md',
  children,
}) => {
  return (
    <MantineModal
      opened={isOpen}
      onClose={onClose}
      title={
        <Group gap="xs">
          {titleIcon}
          <Text fw={600}>{title}</Text>
        </Group>
      }
      size={size}
      centered
    >
      {children}
    </MantineModal>
  );
};

export default Modal;
