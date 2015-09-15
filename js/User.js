/**
 * Created by Administrator on 2015/9/14.
 */

//创建User命名空间，包含用户相关的所有结构
function UsrObj(name,sessionid)
{
  this.name = name;
  this.sessionid = sessionid;
  this.SimResArray = new Array();
  this.RealResArray = new Array();
  this.SimResId = 0;
  this.RealResId = 0;
}

//定义方法
UsrObj.prototype = {

  GetSimResId: function () {
    return this.SimResId;
  },

  SetSimResId: function (SimResId) {
    this.SimResId = SimResId;
  },

  QueryResList:function(){

    var ReqContent = {
      "":""
    };
    var contentTypeStr = 'application/json;charset=UTF-8';
    var urlpara = '/front/resource?all=1';

    $.ajax({
      type:"GET",
      url:urlpara,
      cache:false,
      dataType:'json',
      contentType:contentTypeStr,
      data:JSON.stringify(ReqContent),

      success:this.ProcessQueryResList,
      error: function() {
        alert("ResList Fetch Error!");
      }
    });
  },

  ProcessQueryResList:function(ResListArray) {
    var item = null;
    var InsertBlock = '';
    var Res = null;

    if(ResListArray.length === 0)
    {
      return;
    }
    //遍历主设备资源列表
    for(var MajorResIndx in ResListArray)
    {
      item = ResListArray[MajorResIndx].sub_resource;
      if(item.length === 0)
      {
        continue;
      }

      if(ResListArray[MajorResIndx].type === 'simulation')
      {
        InsertBlock = '#Sim_reslist tbody';
        //遍历从设备资源列表
        for(var MinorResIndx in item)
        {
          item[MinorResIndx].ip = ResListArray[MajorResIndx].ip;
          //记录到对应实例中
          Res = new SimResource(this.GetSimResId(),MajorResIndx,MinorResIndx);
          this.SimResArray[this.GetSimResId()] = Res;
          this.SetSimResId(this.GetSimResId() + 1);

          Res.AddResItemToList(item[MinorResIndx]);
        }
      }
      else if(ResListArray[MajorResIndx].type === 'real')
      {
        InsertBlock = '#Realres_list tbody';
        //TODO:添加真实环境处理
      }

    }
  },

  QueryTaskListStatus:function(){
    var ReqContent = {
      "":""
    };
    var contentTypeStr = 'application/json;charset=UTF-8';
    var urlpara = '/front/task/list?major_id=1&minor_id=1';

    $.ajax({
      type:"GET",
      url:urlpara,
      cache:false,
      dataType:'json',
      contentType:contentTypeStr,
      data:JSON.stringify(ReqContent),

      success:function(data){
        //TODO:重构
        var template = $("#panel_module").clone();

      },
      error: function() {
        alert("QueryHistoryLog Error!");
      }
    });
  },

  Logout: function() {
    var contentTypeStr = 'application/json;charset=UTF-8';
    var urlpara = '/front/user/logout/';
    var cookie_session = 'xwsessionid';
    var cookie_name = 'username';

    $.ajax({
      type:"POST",
      url:urlpara+ this.sessionid,
      cache:false,
      dataType:'json',
      contentType:contentTypeStr,
      data:JSON.stringify({
        "xwsessionid":$.cookie(cookie_session)
      }),

      success:function(data) {
        if(data.result === 0 && data.message === 'success')
        {
          $.cookie(cookie_session, null);
          $.cookie(cookie_name, null);
          location.href ="index.html"
        }
        else
        {
          console.log("登出失败\n" + data.result+'\n' + data.message);
        }

      },
      error: function() {
        console.log("Ajax响应异常！");
      }
    });
  }

};
