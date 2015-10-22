/**
 * Created by Administrator on 2015/9/15.
 */

function UserLogout(){
  var contentTypeStr = 'application/json;charset=UTF-8';
  var urlpara = '/front/user/logout/';
  var cookie_session = 'xwsessionid';
  var cookie_name = 'username';
  var cookie_UsrObj = 'UsrObj';
  $.ajax({
    type:"POST",
    url:urlpara,
    cache:false,
    dataType:'json',
    contentType:contentTypeStr,
    success:function(data) {
      if(data.result === 0 && data.message === 'success')
      {
        $.cookie(cookie_session, null);
        $.cookie(cookie_name, null);
        $.cookie(cookie_UsrObj, null);
      }
      else
      {
        console.log("登出失败\n" + data.result+'\n' + data.message);
      }
      location.href ="index.html"
    },
    error: function() {
      console.log("Ajax响应异常！");
    }
  });
}
/*
function SetShareCache(val){
  window.top['_CACHE'] = val;
}

function GetShareCache(){

  if(window.top['_CACHE'] == null){
    return null;
  }
  return window.top['_CACHE'];
}
*/
function SaveObjToCookie(name,Obj){
  var ObjStr = JSON.stringify(Obj);
  $.cookie(name,ObjStr);
}

function LoadObjFromCookie(name){
  var ObjStr = $.cookie(name);
  return JSON.parse(ObjStr);
}

function RecoverUsrObj(Usr){
  Usr.__proto__ = UsrObj.prototype;
  Usr.SetChildObjProtoType();
  return Usr;
}

$(document).ready(function(){

  //观察者模式
  $('#logout').click(function(){UserLogout()});
  //触发DOM绘制完成事件，通知各模块加载相应功能
  $(document).trigger('DocReady');

});

$(window).unload(function(){
  $(document).trigger('WindowDestroy');
});