const resetP = () => {
    const pList = [document.getElementById('figureImage'),
        document.getElementById('figureImage_left'),
        document.getElementById('figureImage_right')];
    let parentNodeP = document.getElementById('figureImage').parentNode;
    //将所有复制
    let pListNew;
    pListNew = [];
    for (const element of pList) {
        pListNew.push(element.cloneNode(true));
        element.parentNode.removeChild(element);
    }
    for (const element of pListNew) {
        element.style.zIndex = 2;
        parentNodeP.appendChild(element);
    }

}

export default resetP;