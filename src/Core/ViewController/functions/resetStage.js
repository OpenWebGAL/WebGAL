import restoreStatus from "./restoreStatus";
import {initcurrentInfo} from "../../StoreControl/StoreControl";

const resetStage = () => {
    restoreStatus(JSON.parse(JSON.stringify(initcurrentInfo)),true);
}

export default resetStage;