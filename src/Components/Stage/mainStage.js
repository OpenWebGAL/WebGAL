import '@icon-park/react/styles/index.css';
import Title from "../UI/title";
import StartPage from "../UI/startPage";
import AssetsContainer from "./assetsContainer";
import Settings from "../UI/settings";
import BacklogContainer from "./backlogContainer";
import Load from "../UI/load";
import Save from "../UI/save";
import BottomBox from "../UI/bottomBox";

function Stage() {
    return (<div className="Stage">
        <StartPage/>
        <Title/>
        <AssetsContainer/>
        <Settings/>
        <BacklogContainer/>
        <Load/>
        <Save/>
        <BottomBox/>
    </div>);
}

export default Stage;