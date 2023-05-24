import Statemachine from "./StateMachine";
import Copyright from "./Copyright";

import styled from "styled-components";

const Main = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
`

const Layout = () => {
    return (
        <Main>
            <Statemachine />
            <Copyright>Copyright SEA4 {(new Date().getFullYear())}</Copyright>
        </Main>
    )
}

export default Layout