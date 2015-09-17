/**
 * Created by Administrator on 2015/9/15.
 */
var Usr = null;

function PageInit(){

  var ResId = $.getURLParam('ResId');
  var UsrNoProto = LoadObjFromCookie('UsrObj');
  Usr = RecoverUsrObj(UsrNoProto);

  $('#BeginTest').click(function(){
    Usr.SimResArray[ResId].CreateTask();

  });
}
function PageDestroy(){
  SaveObjToCookie('UsrObj',Usr);
}

$(document).on('DocReady',PageInit);
$(document).on('WindowDestroy',PageDestroy);