import './css/setting.css';
import './css/common.css'
import '../public/setting.html'
import 'jquery-ui';
//import './assets/jquery.js'
import './jquery-ui-1.12.1.custom/jquery-ui.js';
import './jquery-ui-1.12.1.custom/jquery-ui.css';
import './assets/jquery.ui-contextmenu.js';
var config = require('./config.json');

var list = [];
var para_tmp = {};
window.onload = function () {

    //var button_ok = config.button_ok;
    $("#dialog_info").dialog({
        autoOpen:false,
        resizable: false,
        height: 240,
        modal: true,
        buttons: {
            "确定": function () {
                $(this).dialog("close");
            }
        }
    });
    $("#loading_bar").progressbar({
        value: false
    });

    $("#dialog_loading").dialog({
        autoOpen: false,
        height: 170,
        modal: true,
        dialogClass: "no-close"
    });

    $("#setting_search_submit_button").button().click(function (e) {
        var para = {};
        if ($("#setting_search_id").val()) {
            para.id = $("#setting_search_id").val();
        }
        if ($("#setting_search_ismain").val()) {
            para.isMain = $("#setting_search_ismain").val();
        }
        if ($("#setting_search_modulepath").val()) {
            para.modulePath = $("#setting_search_modulepath").val();
        }
        if ($("#setting_search_modulename").val()) {
            para.moduleName = $("#setting_search_modulename").val();
        }
        if ($("#setting_search_routerurl").val()) {
            para.routerUrl = $("#setting_search_routerurl").val();
        }
        if ($("#setting_search_template").val()) {
            para.template = $("#setting_search_template").val();
        }
        queryModule(para);
        para_tmp = para;
    });

    var allFields = $([])
        .add($("#input_ismain"))
        .add($("#input_modulepath"))
        .add($("#input_modulename"))
        .add($("#input_routerurl"))
        .add($("#input_template"));

    $("#dialog-form").dialog({
        title: config.add_new_module,
        autoOpen: false,
        height: 520,
        width: 350,
        modal: true,
        buttons: {
            "添加新组件": function () {
                allFields.removeClass("ui-state-error");
                var para_add = {};
                if ($("#input_ismain").val()) {
                    para_add.isMain = $("#input_ismain").val();
                } 
                if ($("#input_modulepath").val()) {
                    para_add.modulePath = $("#input_modulepath").val();
                } else {
                    $("#input_modulepath").addClass("ui-state-error");
                    return false;
                }
                if ($("#input_modulename").val()) {
                    para_add.moduleName = $("#input_modulename").val();
                } else {
                    $("#input_modulename").addClass("ui-state-error");
                    return false;
                }
                if ($("#input_routerurl").val()) {
                    para_add.routerUrl = $("#input_routerurl").val();
                } else {
                    $("#input_routerurl").addClass("ui-state-error");
                    return false;
                }
                if ($("#input_template").val()) {
                    para_add.template = $("#input_template").val();
                }
                addModule(para_add);
                $(this).dialog("close");
            },
            "保存": function () {
                allFields.removeClass("ui-state-error");
                var para_edit = {};
                if ($("#input_ismain").val()) {
                    para_edit.isMain = $("#input_ismain").val();
                } 
                if ($("#input_modulepath").val()) {
                    para_edit.modulePath = $("#input_modulepath").val();
                } else {
                    $("#input_modulepath").addClass("ui-state-error");
                    return false;
                }
                if ($("#input_modulename").val()) {
                    para_edit.moduleName = $("#input_modulename").val();
                } else {
                    $("#input_modulename").addClass("ui-state-error");
                    return false;
                }
                if ($("#input_routerurl").val()) {
                    para_edit.routerUrl = $("#input_routerurl").val();
                } else {
                    $("#input_routerurl").addClass("ui-state-error");
                    return false;
                }
                if ($("#input_template").val()) {
                    para_edit.template = $("#input_template").val();
                }
                para_edit.id = list[$(this).data("index")].id;
                editModule(para_edit);
                $(this).dialog("close");
            },
            "取消": function () {
                $(this).dialog("close");
            }
        },
        close: function () {
            allFields.val("").removeClass("ui-state-error");
        }
    });

    $("#create-user")
        .button()
        .click(function () {
            $("#dialog-form").dialog("option", "title", config.add_new_module).dialog("open");
            $("#dialog-form").siblings(".ui-dialog-buttonpane").find("button").eq(0).show();
            $("#dialog-form").siblings(".ui-dialog-buttonpane").find("button").eq(1).hide();
        });
}

function queryModule(para) {
    $.ajax({
        type: 'post',
        url: config.base_url + '/modules/query',
        async: true,
        data: JSON.stringify(para),
        contentType: "application/json; charset=UTF-8",
        dataType: 'json',
        beforeSend: function () {
            //console.log("请求");
            showLoadingDialog();
        },
        success: function (data) {
            var s = JSON.stringify(data);
            console.log(s);
            if (data.code === 0) {
                list = [];
                list = data.value;
                showList(list);
                setRightKeyMenu();
            } else {
                showDialog(data.msg);
            }
            closeLoadingDialog();

        },
        error: function (error) {
            showDialog(error.status+"<br>"+error.statusText);
            closeLoadingDialog();
        }
    });
}

function showList(listData) {
    $("#setting_list_right>ul").empty();
    var i;
    for (i = 0; i < listData.length; i++) {
        console.log(list[i].moduleName);
        $("#setting_list_right>ul").append("<li>" + list[i].moduleName + "</li>");
    }
}

/**
 * 设置列表鼠标右键菜单
 */
function setRightKeyMenu() {
    $("#setting_list_right>ul>li").addClass("hasMenu");
    $("#setting_list_right>ul").contextmenu({
        delegate: ".hasMenu",
        menu: [{
                title: config.button_edit,
                cmd: "edit"
            },
            {
                title: config.button_delete,
                cmd: "delete"
            }
        ],
        select: function (event, ui) {
            if (ui.cmd === "edit") {
                openAndInitEditDialog(ui.target.index());
            } else if (ui.cmd === "delete") {
                deteleModule(ui.target.index());
            } else {

            }

        }
    });
}

//删除请求
function deteleModule(index) {
    $.ajax({
        url: config.base_url + "/modules/" + list[index].id,
        async: true,
        type: "DELETE",
        contentType: "application/json; charset=UTF-8", //设置请求参数类型为json字符串
        dataType: "json",
        beforeSend: function () {
            showLoadingDialog();
        },
        success: function (result) {
            if (result.code === 0) {
                queryModule(para_tmp);
            } else {
                showDialog(result.msg);
                // alert(result.msg);
            }
            closeLoadingDialog();
        },
        error: function (error) {
            showDialog(error.status+"<br>"+error.statusText);
            // showDialog(error);
            // alert("请求失败");
            closeLoadingDialog();
        }

    });
}

/**
 * 添加组件请求
 * @param {*} para 
 */
function addModule(para) {
    $.ajax({
        type: 'post',
        url: config.base_url + '/modules',
        async: true,
        data: JSON.stringify(para),
        contentType: "application/json; charset=UTF-8",
        dataType: 'json',
        beforeSend: function () {
            showLoadingDialog();
        },
        success: function (data) {
            // var s = JSON.stringify(data);
            // console.log(s);
            if (data.code === 0) {
                queryModule(para_tmp);
            } else {
                showDialog(data.msg);
                // alert(data.msg);
            }
            closeLoadingDialog();

        },
        error: function (error) {
            // alert("请求失败");
            showDialog(error.status+"<br>"+error.statusText);
            // showDialog(error);
            closeLoadingDialog();
        }
    });
}

/**
 * 打开编辑组件对话框
 * @param {*} index 
 */
function openAndInitEditDialog(index) {
    $("#dialog-form").data("index", index).dialog("option", "title", config.edit_module).dialog("open");
    $("#dialog-form").siblings(".ui-dialog-buttonpane").find("button").eq(1).show();
    $("#dialog-form").siblings(".ui-dialog-buttonpane").find("button").eq(0).hide();
    $("#input_ismain").val(list[index].isMain);
    $("#input_modulepath").val(list[index].modulePath);
    $("#input_modulename").val(list[index].moduleName);
    $("#input_routerurl").val(list[index].routerUrl);
    $("#input_template").val(list[index].template);

}


/**
 * 编辑组件
 *
 * @param {*} index
 * @param {*} para
 */
function editModule(para) {
    $.ajax({
        url: config.base_url + "/modules",
        async: true,
        type: "PUT",
        contentType: "application/json; charset=UTF-8", //设置请求参数类型为json字符串
        data: JSON.stringify(para), //将json对象转换成json字符串发送
        dataType: "json",
        beforeSend: function () {
            showLoadingDialog();
        },
        success: function (result) {
            showDialog(config.edit_success);
            //alert("修改成功");
            if (result.code === 0) {
                queryModule(para_tmp);
            } else {
                showDialog(result.msg);
                //alert(result.msg);
            }
            closeLoadingDialog();
        },
        error: function (error) {
            showDialog(error.status+"<br>"+error.statusText);
            // showDialog(error);
            //alert("请求失败");
            closeLoadingDialog();
        }

    });
}

/**
 * 显示loading对话框
 */
function showLoadingDialog() {
    $("#dialog_loading").dialog("open");
}

/**
 * 关闭loading对话框
 */
function closeLoadingDialog() {
    $("#dialog_loading").dialog("close");
}

/**
 * 弹出对话框显示自定义文字
 * @param {} content 对话框显示文字
 */
function showDialog(content) {
    $("#dialog_info").dialog("open");
    $("#dialog_info>p").html(content);
}