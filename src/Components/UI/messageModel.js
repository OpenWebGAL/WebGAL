const MessageModel = (props) => {
    const titleText = props.titleText;
    const Left = props.Left;
    const Right = props.Right;
    const func = props.func;
    return <div className={'MesMainWindow'}>
        <div className={"MesTitle"}>{titleText}</div>
        <div className={'MesChooseContainer'}>
            <div className={'MesChoose'} onClick={() => {
                func();
                document.getElementById('MesModel').style.display = 'none';
            }}>{Left}</div>
            <div className={'MesChoose'} onClick={() => {
                document.getElementById('MesModel').style.display = 'none';
            }}>{Right}</div>
        </div>
    </div>
}

export default MessageModel;