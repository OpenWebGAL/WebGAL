import pixiRain from "./presets/rain";
import pixiSnow from "./presets/snow";
import pixiRain2 from "./presets/rain2";

const PixiControl = (performType, option) => {
    switch (performType){
        case 'rain':
            pixiRain2(6,10);
            break;
        case 'snow':
            pixiSnow(3);
            break;
        default:
            break;
    }
}

export default PixiControl;