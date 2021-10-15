import './AlertDialog.css'
import React, {Component} from "react";
import * as ReactDOM from "react-dom";

class AlertDialog extends Component {
    state = {
        display: false,
        title: "警告",
        left: "确认",
        right: "取消",
        leftCallback: null,
        rightCallback: null
    }

    /**
     *
     * @param {{title:string,left:{text:string,callback:Function},right:{text:string,callback:Function}}|string|undefined?} option
     */
    open = (option) => {
        if (option == null) return

        if (option instanceof String) {
            this.setState({
                title: option
            })
        } else if (option instanceof Object) {
            if (option.hasOwnProperty('title')) {
                this.setState({
                    title: option.title
                })
            }
            if (option.hasOwnProperty('left')) {
                this.setState({
                    left: option.left?.text,
                    leftCallback: option.left?.callback
                })
            }
            if (option.hasOwnProperty('right')) {
                this.setState({
                    right: option.right?.text,
                    rightCallback: option.right?.callback
                })
            }
        }

        this.setState({
            display: true
        })
    }

    closeAlertDialog() {
        this.setState({
            display: false,
            title: "",
            left: "",
            right: "",
            leftCallback: null,
            rightCallback: null
        })
    }

    leftSelected = () => {
        if (this.state?.leftCallback != null && this.state?.leftCallback instanceof Function)
            this.state?.leftCallback()
        this.closeAlertDialog()
    }

    rightSelected = () => {
        if (this.state?.rightCallback != null && this.state?.rightCallback instanceof Function)
            this.state?.rightCallback()
        this.closeAlertDialog()
    }

    render() {
        return (
            <div id="MesModel" style={{'display': this.state.display ? 'block' : 'none'}}>
                <div className='MesMainWindow'>
                    <div className="MesTitle">{this.state.title}</div>
                    <div className='MesChooseContainer'>
                        <div className='MesChoose' onClick={this.leftSelected}>{this.state.left}</div>
                        <div className='MesChoose' onClick={this.rightSelected}>{this.state.right}</div>
                    </div>
                </div>
            </div>
        )
    }
}

let div = document.createElement('div');
document.body.appendChild(div);

export default ReactDOM.render(<AlertDialog/>, div)