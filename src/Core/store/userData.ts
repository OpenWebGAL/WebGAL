/**
 * 用于存储与本地存储交换的状态信息。
 * 这些状态会在指定的生命周期与本地存储发生交换，比如打开存档界面、存档、修改设置时。
 * 在引擎初始化时会将这些状态从本地存储加载到运行时状态。
 */
enum playSpeed{
    slow,
    normal,
    fast
}

interface OptionData{
    volumeMain:number,
    textSpeed:playSpeed,
    autoSpeed:playSpeed,
    vocalVolume:number,
    bgmVolume:number
}