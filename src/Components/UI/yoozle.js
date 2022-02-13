const Yoozle = ()=>{
    return <div className="yoozle-container">
        <div className="yoozle-title">
                    <span>
                        <span className="yoozle-gl-blue">Y</span><span className="yoozle-gl-red">o</span><span
                        className="yoozle-gl-yellow">o</span><span className="yoozle-gl-blue">z</span><span
                        className="yoozle-gl-green">l</span><span className="yoozle-gl-red yoozle-e-rotate">e</span>
                    </span>
        </div>
        <div className="yoozle-search">
            <input className="yoozle-search-bar" type="text" defaultValue=""/>
            <div className="yoozle-search-buttons">
                <input className="yoozle-btn" type="submit" value="Yoozle Search"/>
                <input className="yoozle-btn" type="submit" value="I'm Feeling Lucky"/>
            </div>
        </div>
    </div>
}

export default Yoozle;