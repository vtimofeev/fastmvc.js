///<reference path='./../d.ts'/>
// KeyCodes https://github.com/timoxley/keycode/blob/master/index.js

module ft {

    export const KeyCode =  {


        // default
        'Backspace': 8,
        'Tab': 9,
        'Enter': 13,
        'Shift': 16,
        'Ctrl': 17,
        'Alt': 18,
        'PauseBreak': 19,
        'CapsLock': 20,
        'Esc': 27,
        'Space': 32,
        'PageUp': 33,
        'PageDown': 34,
        'End': 35,
        'Home': 36,
        'Left': 37,
        'Up': 38,
        'Right': 39,
        'Down': 40,
        'Insert': 45,
        'Delete': 46,
        'Command': 91,
        'LeftCommand': 91,
        'RightCommand': 93,
        'Numpad*': 106,
        'Numpad+': 107,
        'Numpad-': 109,
        'Numpad.': 110,
        'Numpad/': 111,
        'NumLock': 144,
        'ScrollLock': 145,
        'MyComputer': 182,
        'MyCalculator': 183,
        ';': 186,
        '=': 187,
        ',': 188,
        '-': 189,
        '.': 190,
        '/': 191,
        '`': 192,
        '[': 219,
        '\\': 220,
        ']': 221,
        "'": 222,


        // aliases
        'Windows': 91,
        'Control': 17,
        'Option': 18,
        'Alt': 18,
        'Pause': 19,
        'Break': 19,
        'Caps': 20,
        'Return': 13,
        'Escape': 27,
        'Spc': 32,
        'PgUp': 33,
        'PgDn': 34,
        'Ins': 45,
        'Del': 46,
        'Cmd': 91
    };

    export class KeyboardModel extends fmvc.Model<any> {
        public static Name:string = 'KeyboardModel';

        constructor(data?:any, opts?:fmvc.IModelOptions) {
            super(KeyboardModel.Name, data, opts);
        }
    }

}