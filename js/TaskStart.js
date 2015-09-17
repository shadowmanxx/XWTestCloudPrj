/**
 * Created by Administrator on 2015/9/15.
 */

function PageInit(){

  var ResId = $.getURLParam('ResId');
  var MajorId = $.getURLParam('MajorId');
  var MinorId = $.getURLParam('MinorId');
  var Res = null;

  if(ResId == null || MajorId == null || MinorId == null)
  {
    alert('请选择测试设备');
    window.open("homepage.html","_self");
  }
  Res = new SimResource(ResId,MajorId,MinorId);

  $('#BeginTest').click(function(){
    Res.CreateTask();
  });
}
function PageDestroy(){
  //SaveObjToCookie('UsrObj',Usr);
}

$(document).on('DocReady',PageInit);
$(document).on('WindowDestroy',PageDestroy);