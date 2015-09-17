/**
 * Created by Administrator on 2015/9/14.
 */

//创建User命名空间，包含用户相关的所有结构
function UsrObj(name,sessionid){
  this.name = name;
  this.sessionid = sessionid;
  this.SimResArray = new Array();
  this.RealResArray = new Array();
  this.SimResId = 0;
  this.RealResId = 0;
}

//定义方法
UsrObj.prototype = {
  GetSimResId:function() {
  return this.SimResId;
},

  SetSimResId:function(SimResId) {
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
      context:this,
      data:JSON.stringify(ReqContent),

      success:this.ProcessQueryResList,
      error: function() {
        alert("ResList Fetch Error!");
      }
    });
  },

  ProcessQueryResList:function(ResListArray) {
    var item = null;
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

  SetChildObjProtoType: function () {
    var Child = this.SimResArray;
    for(item in Child)
    {
      Child[item].__proto__ = SimResource.prototype;
      Child[item].SetChildObjProtoType();
    }

    Child = this.RealResArray;
    for(item in Child)
    {
      //Child[item].prototype = Resource.prototype;
    }
  }
};
