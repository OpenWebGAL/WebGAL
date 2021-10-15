function LocalStorageUtil() {
    const STORAGE_KEY = 'WebGAL'

    function loadData() {
        if (localStorage.getItem(STORAGE_KEY)) {
            return JSON.parse(localStorage.getItem(STORAGE_KEY))
        }
    }

    function saveData(state) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    function clearData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(null));
    }

    return {loadData, saveData, clearData}
}

export default LocalStorageUtil()