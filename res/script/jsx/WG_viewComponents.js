// -------- 导入导出存档 --------
class ImporterExporter extends React.Component {
    constructor() {
        super();
        this.dummyA = null;
        this.dummyInput = null;
    }


    componentDidMount() {
        this.dummyA = document.querySelector('a#dummy-saves-exporter');
        this.dummyInput = document.querySelector('input#dummy-saves-importer');
    }


    importSaves(ev) {
        const file = ev.target.files[0];
        const reader = new FileReader();
        reader.onload = (evR) => {
            const saves = evR.target.result;
            localStorage.setItem('WebGAL', saves);
            loadCookie();
            window.location.reload();  // dirty: 强制刷新 UI
        };
        reader.readAsText(file, 'UTF-8');
    }


    exportSaves() {
        const saves = localStorage.getItem('WebGAL');
        if (saves === null) {
            // no saves
            return false;
        }
        const blob = new Blob([saves], { type: 'application/json' });
        const blobUrl = URL.createObjectURL(blob);
        URL.revokeObjectURL(this.dummyA.href);
        this.dummyA.href = blobUrl;
        this.dummyA.download = 'saves.json';
        this.dummyA.click();
        return true;
    }


    render() {
        return (
            <div className="importer-exporter">
                <span className="label-saves-exporter" onClick={() => { this.exportSaves(); }}>导出存档</span>
                <a target="_blank" id="dummy-saves-exporter" style={{ display: "none" }}></a>
                <span className="label-saves-importer" onClick={() => { this.dummyInput.click(); }}>导入存档</span>
                <input type="file" id="dummy-saves-importer" style={{ display: "none" }} onChange={this.importSaves}></input>
            </div>
        );
    }


    checkSyntax(text) {
        try {
            const json = JSON.parse(text);
        } catch (error) {
            return false;
        }
        return true;
    }
}

class SettingButtons_font extends React.Component{
    constructor(props) {
        super(props);
        this.state = {buttonState : ['','','']}
    }

    componentDidMount() {
        let buttonStateNow = ['','',''];
        if(Settings['font_size'] === 'small'){
            buttonStateNow[0] = 'On';
        }else if (Settings['font_size'] === 'medium'){
            buttonStateNow[1] = 'On';
        }else if (Settings['font_size'] === 'large'){
            buttonStateNow[2] = 'On';
        }
        this.setState(
            {
                buttonState:buttonStateNow
            }
        )
    }


    componentWillUnmount() {
    }

    changeButtonState(i){
        if(i === 0){
            Settings['font_size'] = 'small';
            document.getElementById('SceneText').style.fontSize = '150%';
        }else if(i === 1){
            Settings["font_size"] = 'medium';
            document.getElementById('SceneText').style.fontSize = '200%';
        }else if(i === 2){
            Settings["font_size"] = 'large';
            document.getElementById('SceneText').style.fontSize = '250%';
        }
        let buttonStateNow = ['','',''];
        if(Settings['font_size'] === 'small'){
            buttonStateNow[0] = 'On';
        }else if (Settings['font_size'] === 'medium'){
            buttonStateNow[1] = 'On';
        }else if (Settings['font_size'] === 'large'){
            buttonStateNow[2] = 'On';
        }
        writeCookie();
        this.setState(
            {
                buttonState:buttonStateNow
            }
        )
    }


    render(){

        return(
            <span className="singleSettingItem">
                <span className="settingItemTitle">字体大小</span>
                <span className={'settingItemButton'+this.state.buttonState[0]} onClick={()=>{this.changeButtonState(0)}}>小</span>
                <span className={'settingItemButton'+this.state.buttonState[1]} onClick={()=>{this.changeButtonState(1)}}>中</span>
                <span className={'settingItemButton'+this.state.buttonState[2]} onClick={()=>{this.changeButtonState(2)}}>大</span>
            </span>
        );
    }

}

class SettingButtons_speed extends React.Component{
    constructor(props) {
        super(props);
        this.state = {buttonState : ['','','']}
    }

    componentDidMount() {
        let buttonStateNow = ['','',''];
        if(Settings['play_speed'] === 'low'){
            buttonStateNow[0] = 'On';
        }else if (Settings['play_speed'] === 'medium'){
            buttonStateNow[1] = 'On';
        }else if (Settings['play_speed'] === 'fast'){
            buttonStateNow[2] = 'On';
        }
        this.setState(
            {
                buttonState:buttonStateNow
            }
        )
    }


    componentWillUnmount() {
    }

    changeButtonState(i){
        if(i === 0){
            Settings['play_speed'] = 'low';
            textShowWatiTime = 55;
        }else if(i === 1){
            Settings["play_speed"] = 'medium';
            textShowWatiTime = 35;
        }else if(i === 2){
            Settings["play_speed"] = 'fast';
            textShowWatiTime = 20;
        }
        let buttonStateNow = ['','',''];
        if(Settings['play_speed'] === 'low'){
            buttonStateNow[0] = 'On';
        }else if (Settings['play_speed'] === 'medium'){
            buttonStateNow[1] = 'On';
        }else if (Settings['play_speed'] === 'fast'){
            buttonStateNow[2] = 'On';
        }
        writeCookie();
        this.setState(
            {
                buttonState:buttonStateNow
            }
        )
    }


    render(){

        return(
            <span className="singleSettingItem">
                <span className="settingItemTitle">播放速度</span>
                <span className={'settingItemButton'+this.state.buttonState[0]} onClick={()=>{this.changeButtonState(0)}}>慢</span>
                <span className={'settingItemButton'+this.state.buttonState[1]} onClick={()=>{this.changeButtonState(1)}}>中</span>
                <span className={'settingItemButton'+this.state.buttonState[2]} onClick={()=>{this.changeButtonState(2)}}>快</span>
            </span>
        );
    }

}

class LoadMainModel extends  React.Component{
    Buttons = [];
    SaveButtons = [];
    LoadPageQty = 0;
    setCurrentPage(page){
        currentLoadPage = page;
        this.setState({
            currentPage:currentLoadPage
        })
        writeCookie();
    }

    loadButtons(){
        this.Buttons = [];
        for (let i = 0; i < this.LoadPageQty; i++) {
            let temp =<span className="LoadIndexButton" onClick={()=>{this.setCurrentPage(i)}} key={i}>{i+1}</span>
            if(i === currentLoadPage)
                temp =<span className="LoadIndexButtonOn" onClick={()=>{this.setCurrentPage(i)}} key={i}>{i+1}</span>
            this.Buttons.push(temp);
        }
    }

    loadSaveButtons(){
        this.SaveButtons = [];
        for (let i = currentLoadPage*5+1; i <= currentLoadPage*5+5; i++) {
            if(Saves[i]){
                let thisButtonName = Saves[i]["showName"];
                let thisButtonText = Saves[i]["showText"];
                let temp = <div className="LoadSingleElement" key={i} onClick={()=>{LoadSavedGame(i)}}>
                    <div className="LSE_top">
                        <span className={"LSE_index"}>{i}</span>
                        <span className={"LSE_name"}>{thisButtonName}</span>
                    </div>
                    <div className="LSE_bottom">
                        {thisButtonText}
                    </div>
                </div>
                this.SaveButtons.push(temp);
            }else
            {
                let temp = <div className="LoadSingleElement" key={i}>空</div>
                this.SaveButtons.push(temp);
                // console.log(i)
            }

        }
    }

    constructor(props) {
        super(props);
        this.LoadPageQty = props.PageQty;
        this.state = {
            currentPage:currentLoadPage
        }
        this.loadButtons();
    }

    componentDidMount() {
    }


    componentWillUnmount() {
    }

    render(){
        this.loadButtons();
        this.loadSaveButtons();
        return(
            <div id="LoadMain">
                <div id="LoadIndex">
                    {this.Buttons}
                </div>
                <div id="LoadButtonList">
                    {this.SaveButtons}
                </div>
            </div>

        );
    }
}

class SaveMainModel extends  React.Component{
    Buttons = [];
    SaveButtons = [];
    LoadPageQty = 0;
    setCurrentPage(page){
        currentSavePage = page;
        this.setState({
            currentPage:currentSavePage
        })
        writeCookie();
    }

    loadButtons(){
        this.Buttons = [];
        for (let i = 0; i < this.LoadPageQty; i++) {
            let temp =<span className="SaveIndexButton" onClick={()=>{this.setCurrentPage(i)}} key={i}>{i+1}</span>
            if(i === currentSavePage)
                temp =<span className="SaveIndexButtonOn" onClick={()=>{this.setCurrentPage(i)}} key={i}>{i+1}</span>
            this.Buttons.push(temp);
        }
    }

    loadSaveButtons(){
        this.SaveButtons = [];
        for (let i = currentSavePage*5+1; i <= currentSavePage*5+5; i++) {
            if(Saves[i]){
                let thisButtonName = Saves[i]["showName"];
                let thisButtonText = Saves[i]["showText"];
                let temp = <div className="SaveSingleElement" key={i} onClick={()=>{this.save_onSaved(i)}}>
                    <div className="SSE_top">
                        <span className={"SSE_index"}>{i}</span>
                        <span className={"SSE_name"}>{thisButtonName}</span>
                    </div>
                    <div className="SSE_bottom">
                        {thisButtonText}
                    </div>
                </div>
                this.SaveButtons.push(temp);
            }else
            {
                let temp = <div className="SaveSingleElement" key={i} onClick={()=>{this.save_NonSaved(i)}}>空</div>
                this.SaveButtons.push(temp);
                // console.log(i)
            }

        }
    }

    save_NonSaved(index){
        saveGame(index);
        writeCookie();
        this.setState({
            currentPage:currentSavePage
        });
    }

    save_onSaved(index){
        showMesModel('你要覆盖这个存档吗','覆盖','不',function () {
            saveGame(index);
            writeCookie();
            closeSave();
        })
        this.setState({
            currentPage:currentSavePage
        });
    }

    constructor(props) {
        super(props);
        this.LoadPageQty = props.PageQty;
        this.state = {
            currentPage:currentSavePage
        }
        this.loadButtons();
    }

    componentDidMount() {
    }


    componentWillUnmount() {
    }

    render(){
        this.loadButtons();
        this.loadSaveButtons();
        return(
            <div id="SaveMain">
                <div id="SaveIndex">
                    {this.Buttons}
                </div>
                <div id="SaveButtonList">
                    {this.SaveButtons}
                </div>
            </div>

        );
    }
}