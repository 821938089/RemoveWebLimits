import { DOMContentLoaded } from './lib';
import Setting from './setting';
import App from './app';
import buttonCss from './button.css';
import menuCss from './menu.css';

class UI {
    static async init() {
        // iframe  不用加载
        if (window.self !== window.top) return;
        await UI.initButtonElement();
        UI.registerButtonEvent();
        UI.initMenuElement();
        UI.registerDrag();
        UI.registerUiObserve();
        GM_registerMenuCommand('复制限制解除 设置', () => UI.toggleMenu());

    }
    
    static async initButtonElement() {
        // 等待 DOM 初始化
        await DOMContentLoaded();

        const buttonStyle = `position: fixed;
            top: ${this.buttonHeight()}px;
            left: ${Setting.positionLeft}px;
            right: ${Setting.positionRight}px;`;

        UI.checkBox = (
            <input
                type="checkbox"
                id="black_node"
                checked={App.inBlackList()}
            />
        );

        UI.setButton = (
            <qxinbutton type="qxinbutton" id="rwl-setbtn">
                {' '}
                set{' '}
            </qxinbutton>
        );

        UI.button = (
            <div id="rwl-iqxin" className="rwl-exempt" style={buttonStyle}>
                {UI.setButton}
                <lalala style="cursor:move; font-size:12px;">限制解除 </lalala>
                {UI.checkBox}
                <style>
                    {Setting.addBtn
                        ? buttonCss
                        : buttonCss + '#rwl-iqxin{display:none}'}
                </style>
            </div>
        );

        document.body.appendChild(UI.button);
    }

    static registerButtonEvent() {
        // 改变窗口大小的情况
        window.onresize = () => {
            UI.button.style.top = `${UI.buttonHeight()}px`;
        };

        UI.button.addEventListener('mouseover', () => {
            UI.button.classList.add('rwl-active-iqxin');
        });

        UI.button.addEventListener('mouseleave', () => {
            setTimeout(() => {
                UI.button.classList.remove('rwl-active-iqxin');
                UI.updateBlackList(UI.isChecked());
            }, 100);
        });

        // 给按钮绑定点击事件
        UI.setButton.addEventListener('click', () => UI.toggleMenu());
    }

    static isChecked() {
        return UI.checkBox.checked;
    }

    static buttonHeight() {
        // 再次打开窗口小于之前窗口的情况,导致按钮出现在可视窗口之外
        const clientHeight = document.documentElement.clientHeight;
        let buttonHeight =
            Setting.positionTop > clientHeight
                ? clientHeight - 40
                : Setting.positionTop;
        return buttonHeight < 0 ? 0 : buttonHeight;
    }

    // 初始化菜单元素
    static initMenuElement() {
        let settingData;
        UI.menu = (
            <div id="rwl-setMenu" style="display: none;">
                <p>
                    距离顶部距离（单位 像素）{' '}
                    <input
                        id="positiontop"
                        type="text"
                        value={Setting.positionTop}
                        onChange={function () {
                            Setting.positionTop = parseInt(this.value);
                        }}
                    />
                </p>
                {/* <p id="rwl-shortcuts" title="快捷键">
                    快捷键：
                    <select
                        id="rwl-shortcut"
                        onChange={function () {
                            Setting.shortcut = this.selectedIndex;
                        }}
                    >
                        <option value="off" selected={Setting.shortcut === 0}>
                            关闭
                        </option>
                        <option value="f1" selected={Setting.shortcut === 1}>
                            {' '}
                            F1{' '}
                        </option>
                        <option
                            value="ctrlf1"
                            selected={Setting.shortcut === 2}
                        >
                            ctrl + F1
                        </option>
                        <option value="ctrlc" selected={Setting.shortcut === 3}>
                            ctrl + C
                        </option>
                    </select>
                </p> */}
                <laberl>
                    {' '}
                    <p>
                        显示按钮
                        <input
                            id="btnchecked"
                            type="checkbox"
                            checked={Setting.addBtn}
                            onChange={function () {
                                Setting.addBtn = this.checked;
                            }}
                        />{' '}
                        点击脚本管理扩展可以再次打开设置
                    </p>
                </laberl>
                <p>
                    问题反馈地址:{' '}
                    <a
                        target="_blank"
                        href="https://github.com/qxinGitHub/Remove-web-limits-"
                    >
                        GitHub(qxin)
                    </a>
                    ,{' '}
                    <a
                        target="_blank"
                        href="https://greasyfork.org/zh-CN/scripts/28497-remove-web-limits-modified"
                    >
                        GreasyFork(qxin)
                    </a>{' '}
                </p>
                <p>
                    项目原作者为{' '}
                    <a
                        target="_blank"
                        href="https://cat7373.github.io/remove-web-limits/"
                    >
                        cat7373
                    </a>
                    ,{' '}
                    <a
                        target="_blank"
                        href="https://github.com/Cat7373/remove-web-limits"
                    >
                        项目主页
                    </a>{' '}
                </p>
                <p>能力有限,不能每个网站都能完美</p>
                <p>如若反馈,务必带上详细网址</p>
                <p> </p>
                <p>数据存储方式为JSON,如若在此修改,注意引号逗号</p>
                <textarea
                    wrap="off"
                    cols="45"
                    rows="20"
                    style="overflow:auto;border-radius:4px;"
                    onChange={function () {
                        settingData = this.value;
                        Setting.blackList = JSON.parse(this.value);
                    }}
                >
                    {JSON.stringify(Setting.blackList, false, 4)}
                </textarea>
                <br />
                <qxinbutton
                    id="rwl-reset"
                    onclick={() => {
                        Setting.reset();
                        window.location.reload();
                    }}
                >
                    清空设置
                </qxinbutton>{' '}
                &nbsp;&nbsp;&nbsp;
                <qxinbutton
                    id="rwl-setMenuSave"
                    onclick={() => {
                        if (!settingData) {
                            alert('内容为空');
                            return;
                        }
                        try {
                            JSON.parse(settingData);
                        } catch (e) {
                            alert('内容格式有误');
                            return;
                        }
                        Setting.save();
                        window.location.reload();
                    }}
                >
                    保存
                </qxinbutton>{' '}
                &nbsp;&nbsp;&nbsp;
                <qxinbutton
                    id="rwl-setMenuClose"
                    onclick={() => {
                        UI.toggleMenu();
                        Setting.init();
                    }}
                    title="如果无法关闭 请刷新界面"
                >
                    关闭
                </qxinbutton>{' '}
                &nbsp;&nbsp;&nbsp;
                <span style="font-size:0.7em;">
                    --| qxin v4.4.6 2021-06-09 |--
                </span>
                <style>{menuCss}</style>
            </div>
        );
        document.body.appendChild(UI.menu);
    }

    static toggleMenu() {
        UI.checkExist()
        UI.menu.style.display = UI.menu.style.display ? null : 'none';
    }

    static checkExist(){
        if (window.self !== window.top) return;
        if (!document.querySelector('#rwl-iqxin')) {
            document.body.appendChild(UI.button);
        }
        if (!document.querySelector('#rwl-setMenu')) {
            document.body.appendChild(UI.menu);
        }
    }

    static registerUiObserve(){
        const checkExist = _.throttle(() => UI.checkExist(), 1000);
        const observer = new MutationObserver((mutations) => checkExist())
        observer.observe(document, {
            childList: true,
            subtree: true
        })
    }

    // 注册拖动事件
    static registerDrag() {
        UI.button.addEventListener('mousedown', (event) => {
            UI.button.style.transition = 'null';
            var disX = event.clientX - UI.button.offsetLeft;
            var disY = event.clientY - UI.button.offsetTop;

            var move = (event) => {
                UI.button.style.left = event.clientX - disX + 'px';
                UI.button.style.top = event.clientY - disY + 'px';
            };

            App.addEventListener.call(document,'mousemove', move);
            document.addEventListener('mouseup', function mouseUpHandler() {
                UI.button.style.transition = '0.3s';
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', mouseUpHandler);

                UI.button.style.right = Setting.positionRight = 'auto';
                UI.button.style.left = Setting.positionLeft = 0;

                Setting.positionTop = UI.button.offsetTop;
                Setting.save();
            });
        });
    }

    static updateBlackList(checked) {
        if (checked && !App.inBlackList()) {
            UI.addBlackList();
        } else if (!checked && App.inBlackList()) {
            UI.removeBlackList();
        } else {
            return;
        }
        Setting.save();
        window.location.reload();
    }

    static addBlackList() {
        Setting.blackList.push(window.location.hostname);
    }

    static removeBlackList() {
        const host = window.location.hostname;
        const index = Setting.blackList.indexOf(host);
        Setting.blackList.splice(index, 1);
    }
}

export default UI;
