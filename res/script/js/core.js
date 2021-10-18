//引擎加载完成
window.onload = function () {
    loadCookie();
    loadSettings();
    getGameInfo();
    if(isMobile()){
        MobileChangeStyle();
    }
}
