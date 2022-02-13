// if (savedStatus["fig_Name"] === '' || savedStatus["fig_Name"] === 'none') {
//     ReactDOM.render(<div/>, document.getElementById('figureImage'));
// } else {
//     let pUrl = "game/figure/" + savedStatus["fig_Name"];
//     let changedP = <img src={pUrl} alt='figure' className='p_center'/>
//     // console.log('now changing person');
//     ReactDOM.render(changedP, document.getElementById('figureImage'));
// }
// if (savedStatus["fig_Name_left"] === '' || savedStatus["fig_Name_left"] === 'none') {
//     ReactDOM.render(<div/>, document.getElementById('figureImage_left'));
// } else {
//     let pUrl = "game/figure/" + savedStatus["fig_Name_left"];
//     let changedP = <img src={pUrl} alt='figure' className='p_center'/>
//     // console.log('now changing person');
//     ReactDOM.render(changedP, document.getElementById('figureImage_left'));
// }
// if (savedStatus["fig_Name_right"] === '' || savedStatus["fig_Name_right"] === 'none') {
//     ReactDOM.render(<div/>, document.getElementById('figureImage_right'));
// } else {
//     let pUrl = "game/figure/" + savedStatus["fig_Name_right"];
//     let changedP = <img src={pUrl} alt='figure' className='p_center'/>
//     // console.log('now changing person');
//     ReactDOM.render(changedP, document.getElementById('figureImage_right'));
// }

// let changedName = <span>{savedStatus["showName"]}</span>
// let textArray = savedStatus["showText"].split("");
// ReactDOM.render(changedName, document.getElementById('pName'));
// WG_ViewControl.showTextArray(textArray);

// eslint-disable-next-line default-case
// switch (command) {
//     case 'choose':
//         choose_mode = 'scene';
//         break;
//     case 'choose_label':
//         choose_mode = 'label';
//         break;
// }