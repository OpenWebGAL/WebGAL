import './slider.css'
import {ISlider} from "../../../../Core/interface/componentsInterface/OptionInterface";
import {useEffect} from "react";

export const OptionSlider = (props: ISlider) => {
    useEffect(() => {
        setTimeout(() => {
            const input = document.getElementById(props.uniqueID);
            if (input !== null)
                input.setAttribute('value', props.initValue.toString());
        }, 1)
    }, []);
    return <div className={'Option_WebGAL_slider'}>
        <input id={props.uniqueID} type="range" onChange={props.onChange}/>
    </div>

}