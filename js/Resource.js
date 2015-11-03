/**
 * Created by Administrator on 2015/9/15.
 */
//模拟设备资源类


function SimResource(ID,Majorid,Minorid,status,name,ip){
  this.ID = ID;
  this.Majorid = Majorid;
  this.Minorid = Minorid;
  this.Status = status;
  this.Name = name;
  this.Ip = ip;
  this.UI = new UI(ID);
  this.TaskListSession = '#Simres_list tbody';
}

SimResource.prototype = {
  GetMajorId:function () {
    if(this.Majorid == null)
    {
      return;
    }

    return this.Majorid;
  },

  GetMinorId:function () {
    if(this.Minorid == null)
    {
      return;
    }

    return this.Minorid;
  },

  GetResIndx:function () {
    if(this.ID == null)
    {
      return;
    }

    return this.ID;
  },

  QueryRunningLog: function(callback,task_id,log_id){
    var ReqContent = {
      "":""
    };
    var contentTypeStr = 'application/json;charset=UTF-8';
    var urlpara = '/front/task/log/'+ task_id +"/"+log_id;

    $.ajax({
      type:"GET",
      url:urlpara,
      cache:false,
      dataType:'json',
      contentType:contentTypeStr,
      context:this,
      data:JSON.stringify(ReqContent),

      success:function (TaskLog){

        if(TaskLog.result !== 0 && TaskLog.message !== 'success')        {
          return;
        }

        callback(TaskLog,this);

      },
      error: function() {
        console.log("Get TaskId:"+task_id+" LogQuery Error!");
      }
    });
  },

  TaskStatusQuery: function(task_id,callback){
    var ReqContent = {
      "":""
    };
    var contentTypeStr = 'application/json;charset=UTF-8';
    var urlpara = '/front/task/info/'+ task_id;

    $.ajax({
      type:"GET",
      url:urlpara,
      cache:false,
      dataType:'json',
      contentType:contentTypeStr,
      context:this,
      data:JSON.stringify(ReqContent),

      success:function (TaskStatus){
        callback(TaskStatus);

      },
      error: function() {
        console.log("Get TaskId:"+task_id+" LogQuery Error!");
      }
    });
  },

  CreateTask: function (Para,callback) {

    if (this.Majorid == null || this.Minorid == null) {
      return;
    }

    var ReqContent = {
      "user": $.cookie('username'),
      "type":"simulation",
      "reversion":"",
      "code_path":"",
      "test_group":Para.TestGrpName,
      "resource":{"major_id":this.GetMajorId().toString(), "minor_id":this.GetMinorId().toString()},
      "exe_file":Para.UpLoadPath.lte_app,
      "db_file":Para.UpLoadPath.lte_db

    };
    var contentTypeStr = 'application/json;charset=UTF-8';
    var urlpara = '/front/task';

    this.UI.ClearDOMTextContent('#Log_TaskStatus');

    $.ajax({
      type:"POST",
      url:urlpara,
      cache:false,
      dataType:'json',
      contentType:contentTypeStr,
      context: this,
      data:JSON.stringify(ReqContent),

      success:function (TaskInfo) {
        var LogHandler = null;
        if(TaskInfo.result === 0 && TaskInfo.message === 'success'){
          this.CurTaskId = TaskInfo.task_id;
          LogHandler = callback(TaskInfo);
          this.QueryRunningLog(LogHandler,this.CurTaskId,0);
        }
        else{
          alert('Create Task Failed Info: \nresult = '+ TaskInfo.result + '\nMessage = '+TaskInfo.message);
          $(document).triggerHandler('TaskEnd');
        }
      },

      error: function() {
        $(document).triggerHandler('TaskEnd');
        console.log('Create Task Failed, Resource MajorId:'+this.GetMajorId()+' MinorId:'+this.GetMinorId());
      }
    });
  },

  QueryResHistory:function(){
    //请求历史操作Log
    var ReqContent = {
      "":""
    };
    var contentTypeStr = 'application/json;charset=UTF-8';
    var urlpara = '';
    var IdIndex = this.GetResIndx();

    urlpara = '/front/task/list?major_id='+ this.GetMajorId() +'&minor_id='+this.GetMinorId();

    $.ajax({
      type:"GET",
      url:urlpara,
      cache:false,
      dataType:'json',
      contentType:contentTypeStr,
      context:this,
      data:JSON.stringify(ReqContent),

      success:this.ProcessQueryResHandleHistory,
      error: function() {
        console.log("QueryResHandleHistory Error! ResId = " + this.GetResIndx());
      }
    });

  },

  ProcessQueryResHandleHistory:function(ResHandleHistory){
    var HistoryContent = '';
    var HistoryContent_Hide = '';
    var TaskList = ResHandleHistory.task;
    var CurTime = null;
    var TaskItem  = 0;
    var TaskItem_Hide = 0;
    var max = 0;
    this.UI.ClearDOMTextContent('#Log_ResHandleHistory');
    if(TaskList.length === 0){
      return;
    }

    for(TaskItem = 0,max = TaskList.length; (TaskItem < max) && (TaskItem <5);TaskItem++){
      CurTime = new Date(TaskList[TaskItem].date);
      HistoryContent += '<a style="white-space:pre" href="TaskInfo.html?TaskId='+TaskList[TaskItem].id+'">'+ CurTime.toLocaleString() + '     '+ TaskList[TaskItem].user +
        '   ExecTaskid：'+TaskList[TaskItem].id + '   Status：'+TaskList[TaskItem].status +
        '   Result：'+TaskList[TaskItem].result+'</a>';
    }

    for(TaskItem_Hide = TaskItem,max = TaskList.length; TaskItem_Hide < max;TaskItem_Hide++){
      CurTime = new Date(TaskList[TaskItem_Hide].date);
      HistoryContent_Hide += '<a style="white-space:pre" href="TaskInfo.html?TaskId='+TaskList[TaskItem_Hide].id+'">'+ CurTime.toLocaleString() + '     '+ TaskList[TaskItem_Hide].user +
        '   ExecTaskid：'+TaskList[TaskItem_Hide].id + '   Status：'+TaskList[TaskItem_Hide].status +
        '   Result：'+TaskList[TaskItem_Hide].result+'</a>';
    }


    this.UI.SetDOMHtmlContent('#Log_ResHandleHistory',HistoryContent);
    $('<a class="text-success" href="#"><strong>更多</strong><span class="caret"></span></a>')
      .appendTo('#Log_ResHandleHistory').click(function(){
      this.remove();
      $(HistoryContent_Hide).appendTo('#Log_ResHandleHistory');
    });

  },

  RemoveResItemFromList: function (){
    this.UI.RemoveResTemplate(this.TaskListSession,this.ID);
  },

  QueryInfo:function(callback){
    var urlpara = '/front/resource?major_id=';

    if(this.Majorid ==null ||typeof this.Majorid !=="number" || this.Minorid ==null ||typeof this.Minorid !=="number"){
      console.log("ResHasNo majorId,MinorId");
      return;
    }
    urlpara+=this.Majorid;

    $.ajax({
      type:"GET",
      url:urlpara,
      cache:false,
      dataType:'json',
      contentType:"application/json;charset=UTF-8",
      context:this,
      success:function(ResInfo) {
        if(ResInfo.result == -1){
          console.log(ResInfo.message);
          return;
        }

        callback(ResInfo[0],this.Minorid);
      },
      error: function() {
        console.log("Resource info Fetch Error! MajorId = "+this.Majorid);
      }
    });

  }



};



