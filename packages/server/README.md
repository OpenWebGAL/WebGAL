# WebGAL-Server
WebGAL Server and Command LIne Interface.

WebGAL 本地调试服务器

## 使用说明
### 自动探测模式
自动探测模式在以下两种情况下探测 WebGAL 工程文件：

1、当前目录就是 WebGAL 工程的根目录。

2、当前目录包含名为 'WebGAL' 的目录（不区分大小写），这个目录是 WebGAL 工程的根目录。

### 指定目录模式
通过命令行运行此程序，第一个（且唯一一个）参数就是要指定的绝对或相对路径，是 WebGAL 的工程目录。

**注意：Windows 下的路径不能以 \ 分隔，请以 \\ 或 / 分隔，否则会发生错误。**
