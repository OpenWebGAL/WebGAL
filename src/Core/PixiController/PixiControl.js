import pixiRain from "./presets/rain";
import pixiSnow from "./presets/snow";

const PixiControl = (performType, option) => {
    switch (performType){
        case 'rain':
            pixiRain(3);
            break;
        case 'snow':
            pixiSnow(3);
            break;
        default:
            break;
    }
}

export default PixiControl;