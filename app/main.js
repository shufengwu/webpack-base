import './css/main.css';
import './css/common.css'
import '../public/index.html'
import 'jquery-ui';
import './assets/jquery.js'
import './jquery-ui-1.12.1.custom/jquery-ui.js';
import './jquery-ui-1.12.1.custom/jquery-ui.css';
import './assets/jquery.ui-contextmenu.js';
var config = require('./config.json');

var list_module_temp = [];
var select_list = [];
var buildInfo = "";
var build_result_text = $("#build_result_text");

window.onload = function () {

    $("#dialog_info").dialog({
        autoOpen: false,
        resizable: false,
        height: 440,
        modal: true,
        buttons: {
            "确定": function () {
                //$("#dialog_info").siblings(".ui-dialog-buttonpane").find("p").eq(0).text("");
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


    //alert("成功lelele");
    $("#pagetop").click(function (e) {
        e.preventDefault();
        //showDialog("hehehehe");
    });

    //加载左侧组件列表
    $.ajax({
        type: 'GET',
        url: config.base_url + '/modules',
        async: true,
        dataType: 'json',
        beforeSend: function () {
            showLoadingDialog();
        },
        success: function (data) {
            if (data.code === 0) {
                var list_module = data.value;
                showModuleList(list_module);
                list_module_temp = list_module;
                setDragDrop();
            } else {
                showDialog(data.msg);
                //alert(data.msg);
            }
            closeLoadingDialog();
        },
        error: function (error) {
            //console.log('fail');
            console.log(error);
            showDialog(error.status + "<br>" + error.statusText);
            closeLoadingDialog();
        }
    });

    var allFields = $([])
        .add($("#input_applicationId"))
        .add($("#input_applicationName"))
        .add($("#input_versionCode"))
        .add($("#input_versionName"));

    //build提交对话框
    $("#dialog-form").dialog({
        title: config.submit,
        autoOpen: false,
        height: 450,
        width: 350,
        modal: true,
        buttons: {
            "保存": function () {
                allFields.removeClass("ui-state-error");
                var para_save = {};
                if ($("#input_applicationId").val()) {
                    para_save.applicationId = $("#input_applicationId").val();
                } else {
                    $("#input_applicationId").addClass("ui-state-error");
                    return false;
                }

                if ($("#input_applicationName").val()) {
                    para_save.applicationName = $("#input_applicationName").val();
                } else {
                    $("#input_applicationName").addClass("ui-state-error");
                    return false;
                }

                var para_version = {};
                if ($("#input_versionCode").val()) {
                    para_version.versionCode = $("#input_versionCode").val();
                } else {
                    $("#input_versionCode").addClass("ui-state-error");
                    return false;
                }

                if ($("#input_versionName").val()) {
                    para_version.versionName = $("#input_versionName").val();
                } else {
                    $("#input_versionName").addClass("ui-state-error");
                    return false;
                }
                para_save.version = para_version;
                // if (getModules().length > 0) {
                //     para_save.modules = getModules();
                // } else {
                //     showDialog("还没有选择组件");
                //     //alert("还没有选择组件");
                //     return false;
                // }
                para_save.modules = getModules();
                console.log(JSON.stringify(para_save));
                buildApk(para_save);
                //editModule(list[$(this).data("index")].id,para_edit);
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

    // 点击button“提交并生成安装包”
    $("#ok").click(function (e) {
        e.preventDefault();
        if (getModules().length > 0) {
            $("#dialog-form").dialog("open");
        } else {
            showDialog(config.no_select_module);
            //alert("还没有选择组件");
            return false;
        }
        
    });

}

//显示左侧组件列表
function showModuleList(list) {
    var i;
    for (i = 0; i < list.length; i++) {
        console.log(list[i].moduleName);
        $("#list_left>ul").append("<li>" + list[i].moduleName + "</li>");
    }
}



//获取组件id数组
function getModules() {
    var res = [];
    var i;
    var ll = $("#list_right>ol").children();
    console.log(ll.length);
    for (i = 0; i < ll.length; i++) {
        console.log($(ll[i]).text());
        res.push(getId($(ll[i]).text()));
    }
    return res;
}

/**
 * 更具列表显示内容获取组件id字段
 *
 * @param {*} name 列表显示内容
 * @returns
 */
function getId(name) {
    var i;
    for (i = 0; i < list_module_temp.length; i++) {
        if (list_module_temp[i].moduleName === name) {
            return list_module_temp[i].id;
        }
    }
    return 0;
}


/**
 *设置拖拽和放置
 *
 */
function setDragDrop() {
    $("#list_left>ul>li").draggable({
        helper: "clone",
        cursor: "move",
        cursorAt: {
            top: 25,
            left: 25
        }
    });

    $("#list_right>ol").droppable({
        activeClass: "ui-state-default",
        hoverClass: "ui-state-hover",
        //accept: ":not(.ui-sortable-helper)",
        accept: "#list_left>ul>li",
        drop: function (event, ui) {
            var flag = true;
            $("#list_right>ol>li").each(function (index, element) {
                console.log($(this).text());
                if (ui.draggable.text() === $(this).text()) {
                    flag = false;
                    return false;
                }
            });
            if (flag === true) {
                $(this).find(".placeholder").remove();
                $("<li></li>").text(ui.draggable.text()).appendTo(this);
                //setMouseRightKeyMenu();
            } else {
                //alert("此组件已经存在！");
                $("#dialog_warn").dialog({
                    resizable: false,
                    modal: true,
                    buttons: {
                        "OK": function () {
                            $(this).dialog("close");
                        }
                    }
                });
            }
            //console.log(" ceshi");

            //setMouseRightKeyMenu();
            setRightKeyMenu();

        }
    }).sortable({
        items: "li:not(.placeholder)",
        sort: function () {
            // 获取由 droppable 与 sortable 交互而加入的条目
            // 使用 connectWithSortable 可以解决这个问题，但不允许您自定义 active/hoverClass 选项
            $(this).removeClass("ui-state-default");
        }
    });
}

/**
 * 设置列表鼠标右键菜单
 */
function setRightKeyMenu() {
    $("#list_right>ol>li").addClass("hasMenu");
    $("#list_right>ol").contextmenu({
        delegate: ".hasMenu",
        menu: [{
            title: config.button_delete,
            cmd: "delete"
        }],
        select: function (event, ui) {
            if (ui.cmd === "delete") {
                //console.log(ui.target.index());
                $("#list_right>ol>li").eq(ui.target.index()).remove();
            } else {

            }

        }
    });
}

/**
 * build网络请求
 * @param {*} para 
 */
function buildApk(para) {
    $("#build_result_text").html("");
    buildInfo = "";
    $.ajax({
        type: 'post',
        url: config.base_url + '/modules/build',
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
                // 显示build信息
                //var reg = new RegExp('\r\n','g');
                //$("#build_result_text").html(data.value.log.replace(reg,'<br/>'));
                //$("#page_bottom>a").attr("style","display: block;");
                //$("#page_bottom>a").attr("href", data.value.url);
                //showDialog("安装包已生成！");
                var buildCode = data.value;
                getBuildInfo(buildCode);
            } else {
                showDialog(data.msg);
                closeLoadingDialog();
                //alert(data.msg);
            }
            

        },
        error: function (error) {
            showDialog(error.status + "<br>" + error.statusText);
            //alert("请求失败");
            closeLoadingDialog();
        }
    });
}

/**
 *  获取构建信息
 */
function getBuildInfo(buildCode) {
    $.ajax({
        type: 'post',
        url: config.base_url + '/modules/build/result/' + buildCode,
        async: true,
        contentType: "application/json; charset=UTF-8",
        dataType: 'json',
        beforeSend: function () {
        },
        success: function (data) {
            var s = JSON.stringify(data);
            console.log(s);
            if (data.code === 0) {
                if(data.value.log.length>0){
                    closeLoadingDialog();
                }
                // 显示build信息
                var reg = new RegExp('\r\n', 'g');
                var info = data.value.log.replace(reg, '<br/>');
                buildInfo = buildInfo + info;
                $("#build_result_text").html(buildInfo);
                $("#build_result_text").scrollTop($("#build_result_text")[0].scrollHeight);
                if (data.value.code === 0) {
                    $("#page_bottom>a").attr("style", "display: block;");
                    $("#page_bottom>a").attr("href", data.value.url);
                    showDialog(config.apk_success);
                } else {
                    setTimeout(function () {
                        getBuildInfo(buildCode);
                    }, 300);

                }
            } else {
                showDialog(data.msg);
                closeLoadingDialog();
            }
        },
        error: function (error) {
            console.log(error);
            closeLoadingDialog();
            showDialog(error.status + "<br>" + error.statusText);
        }
    });
}

/**
 * 打开loading对话框
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