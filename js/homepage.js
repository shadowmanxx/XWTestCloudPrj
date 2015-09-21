
function PageInit(){

  //全局唯一实例，TODO:改成单例模式
  /*Usr = LoadObjFromCookie('UsrObj');
  if(Usr == null)
  {

    SaveObjToCookie('UsrObj',Usr);
  }
  else
  {
    //已有实例，改变原型链
    var UsrNoProto = LoadObjFromCookie('UsrObj');
    Usr = RecoverUsrObj(UsrNoProto);
  }*/

  var Usr = new UsrObj($.cookie('username'),$.cookie('xwsessionid'));
  Usr.QueryResList();


}
function PageDestroy(){
  //SaveObjToCookie('UsrObj',Usr);
}

$(document).on('DocReady',PageInit);
$(document).on('WindowDestroy',PageDestroy);


