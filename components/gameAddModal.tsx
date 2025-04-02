import Team from "@/class/Team";
import { Text, Modal, View, TextInput } from "react-native";
import styled from "styled-components/native";
import SelectAbleTeamBtn from "./SelectAbleTeamBtn";
import { useEffect, useState } from "react";

export default function GameAddModal({
  isModalVisible,
  setIsModalVisible,
  onPressConfirm,
  teams,
}: {
  isModalVisible: boolean;
  setIsModalVisible: (isModalVisible: boolean) => void;
  onPressConfirm: (selectedTeams: Team[]) => void;
  teams: Team[];
}) {
  const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);

  const onPress = () => {
    onPressConfirm(selectedTeams);
    setSelectedTeams([]);
  };

  useEffect(() => {
    console.log(selectedTeams);
  }, [selectedTeams]);

  const onPressTeam = (id: number, isPressed: boolean) => {
    const team = teams.find((team) => team.getId() === id);
    if (team) {
      setSelectedTeams((prev) => (isPressed ? [...prev, team] : prev.filter((t) => t.getId() !== id)));
    }
  };

  return (
    <Modal visible={isModalVisible} animationType="slide" transparent={true}>
      <ModalViewStyled>
        <TeamBoxContainerStyled>
          {teams.map((team) => (
            <SelectAbleTeamBtn key={team.getId()} id={team.getId()} text={team.getName()} onPress={onPressTeam} />
          ))}
        </TeamBoxContainerStyled>
        <BtnBoxStyled>
          <ConfirmBtnStyled onPress={onPress}>확인</ConfirmBtnStyled>
          <CancelBtnStyled onPress={() => setIsModalVisible(false)}>취소</CancelBtnStyled>
        </BtnBoxStyled>
      </ModalViewStyled>
    </Modal>
  );
}

const BtnBoxStyled = styled(View)`
  flex-direction: row;
  justify-content: space-between;
`;

const CancelBtnStyled = styled(Text)`
  font-weight: bold;
  font-size: 40px;
  text-align: center;
  justify-content: center;
  color: #000000;
  padding: 20px;
`;
const ModalViewStyled = styled(View)`
  margin-top: 230px;
  background-color: white;
  border-radius: 20px;
  padding: 35px;
  margin-left: 20%;
  margin-right: 20%;
  align-items: center;
  border-width: 2px;
`;

const ConfirmBtnStyled = styled(Text)`
  font-weight: bold;
  font-size: 40px;
  text-align: center;
  justify-content: center;
  color: #000000;
  padding: 20px;
`;

const TeamBoxContainerStyled = styled(View)`
  flex-direction: row;
  justify-content: space-between;
`;

const TeamBoxStyled = styled(View)`
  margin: 5px;
  background-color: #f4f4f4;
  border-radius: 10px;
  width: 50px;
  height: 50px;
  justify-content: center;
`;
