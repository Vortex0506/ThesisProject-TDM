import styled from 'styled-components';

import { UserPlus } from "@styled-icons/boxicons-regular";

const ButtonWrapper = styled.button`
  z-index: 10000;
  position: absolute;
  top: 1rem;
  right: 89rem;
  border-radius: 50%;
  border: 2px solid grey;
  background-color: white;
  color: grey;
  outline: none;
  font-weight: bold;
  cursor: pointer;
  &[disabled] {
    opacity: 0.5;
  }
  :hover {
      color: black;
      border-color: black;
  }
`;

const StyledUserPlus = styled(UserPlus)`
  height: 2rem;
  width: 2rem;
`

type InviteButtonProps = {
    onClick: Function;
}

const InviteButton = ({ onClick }: InviteButtonProps) => (
    <ButtonWrapper onClick={() => onClick()}>
        <StyledUserPlus/>
    </ButtonWrapper>
)

export default InviteButton