// 加载设置数据
class Setting {
    constructor() {
        this.init();
        // https://stackoverflow.com/a/43323115
        return new Proxy(this, this);
    }

    init() {
        let data = GM_getValue('setting');
        if (!data) {
            data = this.defaultSetting();
        }
        this._data = data;
    }

    save() {
        GM_setValue('setting', this._data);
    }

    reset(){
        GM_setValue('setting', this.defaultSetting());
    }

    defaultSetting() {
        return {
            positionTop: '0',
            positionLeft: '0',
            positionRight: 'auto',
            addBtn: true,
            // shortcut: 3,
            blackList: [],
        };
    }

    set(target, prop, value) {
        if (this._data.hasOwnProperty(prop)) {
            this._data[prop] = value;
        } else {
            this[prop] = value;
        }
        return true
    }

    get(target, prop) {
        if (this._data.hasOwnProperty(prop)) {
            return this._data[prop];
        } else {
            return this[prop];
        }
    }
}

export default new Setting();
