/**
 * Created by Administrator on 2015/9/14.
 */

//创建User命名空间，包含用户相关的所有结构
function UsrObj(name,sessionid){
  this.name = name;
  this.sessionid = sessionid;
  this.SimResArray = [];
  this.RealResArray = [];
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
    var MajorId;
    var MinorId;
    if(ResListArray.length === 0)
    {
      return;
    }
    //遍历主设备资源列表
    for(var ResIndx in ResListArray)
    {
      item = ResListArray[ResIndx].sub_resource;
      if(item.length === 0)
      {
        continue;
      }
      MajorId = ResListArray[ResIndx].major_id;
      if(ResListArray[ResIndx].type === 'simulation')
      {
        //遍历从设备资源列表
        for(var SubResIndx in item)
        {
          item[SubResIndx].ip = ResListArray[ResIndx].ip;
          MinorId = item[SubResIndx].minor_id;
          //记录到对应实例中
          Res = new SimResource(this.GetSimResId(),MajorId,MinorId);
          this.SimResArray[this.GetSimResId()] = Res;
          this.SetSimResId(this.GetSimResId() + 1);

          Res.AddResItemToList(item[SubResIndx]);
        }
      }
      else if(ResListArray[ResIndx].type === 'real')
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
