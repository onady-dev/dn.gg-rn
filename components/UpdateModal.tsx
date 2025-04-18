import { Text, Modal, View, TextInput, Platform, Dimensions } from "react-native";
import styled from "styled-components/native";

export default function UpdateModal({
  text,
  isModalVisible,
  setIsModalVisible,
  onPressSave,
  onPressDelete,
  onChangeText,
  placeholder,
  isCancelable = false,
}: {
  text: string;
  isModalVisible: boolean;
  setIsModalVisible: (isModalVisible: boolean) => void;
  onPressSave: () => void;
  onPressDelete: () => void;
  onChangeText: (text: string) => void;
  placeholder: string;
  isCancelable?: boolean;
}) {
  const windowWidth = Dimensions.get('window').width;
  const isWeb = Platform.OS === 'web';
  const fontSize = isWeb ? Math.min(windowWidth * 0.03, 40) : 40;
  const padding = isWeb ? Math.min(windowWidth * 0.02, 20) : 20;

  return (
    <Modal visible={isModalVisible} animationType="slide" transparent={true}>
      <ModalView>
        <GroupName 
          placeholderTextColor={"gray"} 
          placeholder={placeholder} 
          onChangeText={onChangeText} 
          value={text}
        />
        <BtnBox>
          <ConfirmBtn style={{ fontSize, padding }} onPress={onPressSave}>저장</ConfirmBtn>
          <DeleteBtn style={{ fontSize, padding }} onPress={onPressDelete}>삭제</DeleteBtn>
          {isCancelable && (
            <CancelBtn style={{ fontSize, padding }} onPress={() => setIsModalVisible(false)}>
              취소
            </CancelBtn>
          )}
        </BtnBox>
      </ModalView>
    </Modal>
  );
}

const BtnBox = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

const CancelBtn = styled(Text)`
  font-weight: bold;
  text-align: center;
  justify-content: center;
  color: #000000;
`;

const DeleteBtn = styled(Text)`
  font-weight: bold;
  text-align: center;
  justify-content: center;
  color: #000000;
`;

const ModalView = styled(View)`
  margin: auto;
  background-color: white;
  border-radius: 20px;
  padding: ${Platform.OS === 'web' ? '3vw' : '35px'};
  width: ${Platform.OS === 'web' ? '80%' : '60%'};
  max-width: 600px;
  align-items: center;
  border-width: 2px;
`;

const GroupName = styled(TextInput)`
  width: 100%;
  font-size: ${Platform.OS === 'web' ? '2vw' : '30px'};
  min-font-size: 16px;
  max-font-size: 30px;
  text-align: center;
  color: #000000;
  padding: ${Platform.OS === 'web' ? '1vw' : '10px'};
  margin: ${Platform.OS === 'web' ? '1vw' : '10px'};
  background-color: #f4f4f4;
  border-width: 1px;
  border-radius: 10px;
`;

const ConfirmBtn = styled(Text)`
  font-weight: bold;
  text-align: center;
  justify-content: center;
  color: #000000;
`;
