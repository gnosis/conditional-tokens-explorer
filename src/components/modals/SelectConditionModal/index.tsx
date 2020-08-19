import { Modal, ModalBasicProps } from 'components/common/Modal'
import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

interface ModalProps extends ModalBasicProps {
  isOpen: boolean
}

export const SelectConditionModal: React.FC<ModalProps> = (props) => {
  return <Modal {...props}>Select a Condition</Modal>
}
