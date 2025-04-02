import { Text, Modal, View, TextInput } from "react-native";
import styled from "styled-components/native";

export default function BasicModal({
  text,
  isModalVisible,
  onPressConfirm,
  onChangeText,
  placeholder,
  isCancelable = false,
  setIsModalVisible,
}: {
  text: string;
  isModalVisible: boolean;
  onPressConfirm: () => void;
  onChangeText: (text: string) => void;
  placeholder: string;
  isCancelable?: boolean;
  setIsModalVisible: (isModalVisible: boolean) => void;
}) {
  return (
    <Modal visible={isModalVisible} animationType="slide" transparent={true}>
      <ModalView>
        <GroupName placeholderTextColor={"gray"} placeholder={placeholder} onChangeText={onChangeText}>
          {text}
        </GroupName>
        <BtnBox>
          <ConfirmBtn onPress={onPressConfirm}>확인</ConfirmBtn>
          {isCancelable && <CancelBtn onPress={() => setIsModalVisible(false)}>취소</CancelBtn>}
        </BtnBox>
      </ModalView>
    </Modal>
  );
}

const BtnBox = styled(View)`
  flex-direction: row;
  justify-content: space-between;
`;

const CancelBtn = styled(Text)`
  font-weight: bold;
  font-size: 40px;
  text-align: center;
  justify-content: center;
  color: #000000;
  padding: 20px;
`;
const ModalView = styled(View)`
  margin-top: 230px;
  background-color: white;
  border-radius: 20px;
  padding: 35px;
  margin-left: 20%;
  margin-right: 20%;
  align-items: center;
  border-width: 2px;
`;

const GroupName = styled(TextInput)`
  width: 100%;
  font-size: 30px;
  text-align: center;
  color: #000000;
  padding: 10px;
  margin: 10px;
  background-color: #f4f4f4;
  border-width: 1px;
  border-radius: 10px;
`;

const ConfirmBtn = styled(Text)`
  font-weight: bold;
  font-size: 40px;
  text-align: center;
  justify-content: center;
  color: #000000;
  padding: 20px;
`;
