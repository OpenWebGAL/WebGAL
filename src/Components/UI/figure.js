const Figure =(props)=>{
    const P_name = props.P_name;
    let changedP;
    if (P_name === 'none') {
        changedP = <div/>;
    } else {
        let pUrl = "game/figure/" + P_name;
        changedP = <img src={pUrl} alt={'figure'} className={'p_center'}/>
    }

    return changedP;
}

export default Figure;