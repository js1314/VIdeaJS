/**
 * vi.ui Config
 *
 * @author        yonglong_zhu
 * @version    v1.0.0
 *
 */

(function (UI) {

    // 3类弹窗
    var uiDos = UI.Dialog.options;
    var uiCos = UI.Confirm.options;
    var uiAos = UI.Alert.options;

    // 弹窗宽度比例
    uiDos.scale = 1.25;
    uiCos.scale = 1.75;
    uiAos.scale = 1.75;

    // 关闭拖动层
    uiDos.draggable = false;
    uiCos.draggable = false;
    uiAos.draggable = false;

})(window.vi.UI);