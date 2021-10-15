import {useState} from "react";
import './ListContent.css'

function ListContent(props) {
    const [currentPage, setCurrentPage] = useState(0)

    function loadIndexButtons() {
        let indexButtons = []
        for (let i = 0; i < props.LoadPageQty; i++) {
            let temp = <span className={"index_button" + (i === currentPage ? "_on" : "")} onClick={() => {
                setCurrentPage(i)
            }} key={i}>{i + 1}</span>
            indexButtons.push(temp);
        }
        return indexButtons
    }

    function loadListItem() {
        let listItem = [];
        for (let i = currentPage * 5 + 1; i <= currentPage * 5 + 5; i++) {
            let temp = null;
            if (props.data[i]) {
                temp = <div className="list_single_item" key={i} onClick={() => props?.onClickNonEmpty(i)}>
                    <div className="list_top">
                        <span className="list_index">{i}</span>
                        <span>{props.data[i]["showName"]}</span>
                    </div>
                    <div className="list_bottom">
                        {props.data[i]["showText"]}
                    </div>
                </div>
            } else {
                temp = <div className="list_single_item" key={i} onClick={() => props?.onClickEmpty(i)}>空</div>
            }
            listItem.push(temp);
        }
        return listItem
    }

    return (
        <div id="list_container" style={{'--theme-color': props.themeColor}}>
            <div id="list_index">
                {loadIndexButtons()}
            </div>
            <div id="list_content">
                {loadListItem()}
            </div>
        </div>
    );
}

ListContent.defaultProps = {
    LoadPageQty: 10,
    themeColor: "#77428D",
    onClickEmpty: () => {
    },
    onClickNonEmpty: () => {
    }
}

export default ListContent