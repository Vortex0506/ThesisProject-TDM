import styled from 'styled-components';

import { LeftArrowAlt } from "@styled-icons/boxicons-regular";

const ButtonWrapper = styled.button`
  z-index: 10000;
  position: absolute;
  top: 1rem;
  left: 1rem;
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

const StyledArrow = styled(LeftArrowAlt)`
  height: 2rem;
  width: 2rem;
`

type BackButtonProps = {
    onClick: Function;
}

const BackButton = ({ onClick }: BackButtonProps) => (
    <ButtonWrapper onClick={() => onClick()}>
        <StyledArrow />
    </ButtonWrapper>
)

export default BackButton