import '@icon-park/react/styles/index.css';
import Title from "./title";
import StartPage from "./startPage";
import AssetsContainer from "./assetsContainer";
import Settings from "./settings";
import Backlog from "./backlog";
import Load from "./load";
import Save from "./save";
import BottomBox from "./bottomBox";

function Stage() {
    return (<div className="Stage">
        <StartPage/>
        <Title/>
        <AssetsContainer/>
        <Settings/>
        <Backlog/>
        <Load/>
        <Save/>
        <BottomBox/>
    </div>);
}

export default Stage;