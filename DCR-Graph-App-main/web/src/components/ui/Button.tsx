import styled from "styled-components";

interface Props {
  color?: string;
  height?: string;
}

export default styled.button<Props>`
  width: 100%;
  border-radius: 1rem;
  border: none;
  background-color: ${(p) => p.color ? p.color+";" : "#0373fc;"}
  ${(p) =>
    p.height ? "height: " + p.height + "; lineheight: " + p.height + ";" : ""}
  color: white;
  padding: 0.2rem 1rem;
  text-transform: uppercase;
  font-weight: bold;
  cursor: pointer;
  outline: none;
  &[disabled] {
    opacity: 0.5;
  }
`;
