import { Text, Modal, View, TextInput, Platform, Dimensions } from "react-native";
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
  placeholder?: string;
  isCancelable?: boolean;
  setIsModalVisible: (isModalVisible: boolean) => void;
}) {
  const windowWidth = Dimensions.get('window').width;
  const isWeb = Platform.OS === 'web';
  const fontSize = isWeb ? Math.min(windowWidth * 0.03, 40) : 40;
  const padding = isWeb ? Math.min(windowWidth * 0.02, 20) : 20;

  return (
    <Modal visible={isModalVisible} animationType="slide" transparent={true}>
      <ModalView>
        {placeholder ? (
          <TextInputStyled 
            placeholderTextColor={"gray"} 
            placeholder={placeholder} 
            onChangeText={onChangeText} 
            value={text}
          />
        ) : (
          <TextStyled>{text}</TextStyled>
        )}
        <BtnBox>
          <ConfirmBtn style={{ fontSize, padding }} onPress={onPressConfirm}>확인</ConfirmBtn>
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

const TextInputStyled = styled(TextInput)`
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

const TextStyled = styled(Text)`
  width: 100%;
  font-size: ${Platform.OS === 'web' ? '2vw' : '30px'};
  min-font-size: 16px;
  max-font-size: 30px;
  text-align: center;
  color: #000000;
  font-weight: bold;
  padding: ${Platform.OS === 'web' ? '1vw' : '10px'};
  margin: ${Platform.OS === 'web' ? '1vw' : '10px'};
`;

const ConfirmBtn = styled(Text)`
  font-weight: bold;
  text-align: center;
  justify-content: center;
  color: #000000;
`;
