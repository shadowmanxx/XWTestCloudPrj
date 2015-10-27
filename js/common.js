/**
 * Created by Administrator on 2015/9/15.
 */
var XWCld = {
  utilities:{},
  common:{
    UserLogout:function(){
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
  },
  Obj:{}
};

$(document).ready(function(){

  //观察者模式
  var common = XWCld.common;
  $('#logout').click(common.UserLogout);
  //触发DOM绘制完成事件，通知各模块加载相应功能
  $(document).trigger('DocReady');

});
