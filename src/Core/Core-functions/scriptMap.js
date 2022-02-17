const scriptMap = (command) => {
    if (command.substring(0, 3) === "var" || command.substring(0, 8) === "jump_var") {
        return 'var';
    } else if (command.substring(0, 2) === 'if') {
        return 'if';
    } else
        return command;
}

export default scriptMap;
