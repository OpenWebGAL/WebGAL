import pixiRain from "./presets/rain";

const PixiControl = (performType, option) => {
    if (performType === 'rain') {
        pixiRain(7);
    }
}

export default PixiControl;