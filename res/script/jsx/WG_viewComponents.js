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