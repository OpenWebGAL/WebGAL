import pixiRain from "./presets/rain";

const PixiControl = (performType, option) => {
    if (performType === 'rain') {
        pixiRain();
    }
}

export default PixiControl;