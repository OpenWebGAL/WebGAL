/**
 * 事件创建器，用于将事件发送到指定的元素
 * @param targetID 元素ID
 * @param message 发送的信息（目前只能为数字）
 * @param timeout 等待时间
 */

export const eventSender = (targetID: string, message: number, timeout: number): ReturnType<typeof setTimeout> => {
    return setTimeout(() => {
        const event = new MouseEvent('click', {
            'view': window,
            'bubbles': true,
            'cancelable': true,
            'clientX': message,
        });
        const target = document.getElementById(targetID);
        if (target !== null) {
            target.dispatchEvent(event);
        }
    }, timeout);
}