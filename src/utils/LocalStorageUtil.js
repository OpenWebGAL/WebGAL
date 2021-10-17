function LocalStorageUtil() {
    const STORAGE_KEY = 'WebGAL'

    /**
     * 根据 key 读取 data
     * @param {string?} key
     * @returns {any}
     */
    function loadData(key = STORAGE_KEY) {
        if (localStorage.getItem(key)) {
            return JSON.parse(localStorage.getItem(key))
        }
    }

    /**
     * 保存 data 至 LocalStorage 中，可按 key 保存
     * @param {Object} data
     * @param {string?} key
     */
    function saveData(data, key = STORAGE_KEY) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    /**
     * 清空 key 对应的 data
     * @param {string?} key
     */
    function clearData(key = STORAGE_KEY) {
        localStorage.setItem(key, null);
    }

    return {loadData, saveData, clearData}
}

export default LocalStorageUtil()