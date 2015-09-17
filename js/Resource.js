/**
 * Created by Administrator on 2015/9/15.
 */
//模拟设备资源类
function SimResource(Index,Majorid,Minorid){
  this.Index = Index;
  this.Majorid = Majorid;
  this.Minorid = Minorid;
  this.UI = new UI(Index);
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

  CreateTask: function () {

    if (this.Majorid == null || this.Minorid == null) {
      return;
    }

    var cookie_session = 'xwsessionid';
    var ReqContent = {
      "xwsessionid": $.cookie(cookie_session),
      "type":"simulation",
      "reversion":"",
      "code_path":"",
      "test_group":"",
      "resource":{"major_id":this.GetMajorId().toString(), "minor_id":this.GetMinorId().toString()}
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

      success:this.ProcessCreateTask,
      error: function() {
        console.log('Create Task Failed, Resource MajorId:'+this.GetMajorId()+' MinorId:'+this.GetMinorId());
      }
    });
  },

  GetResIndx:function () {
    if(this.Index == null)
    {
      return;
    }

    return this.Index;
  },

  ProcessCreateTask: function (TaskInfo) {

    if(TaskInfo.result === 0 && TaskInfo.message === 'success')
    {
      this.CurTaskId = TaskInfo.task_id;
      this.UI.InsetTaskToList(this.CurTaskId);
      this.QueryRunningLog(this.CurTaskId);
    }
    else
    {
      console.log('Create Task Failed Info: \nresult = '+ TaskInfo.result + '\nMessage = '+TaskInfo.message);
    }
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
    var TaskList = ResHandleHistory.task;
    var CurTime = null;

    this.UI.ClearDOMTextContent('#Log_ResHandleHistory');
    if(TaskList.length === 0)
    {
      return;
    }

    for(var TaskItem in TaskList)
    {
      CurTime = new Date(TaskList[TaskItem].date);
      HistoryContent += '<a style="white-space:pre" href="'+TaskList[TaskItem].log_file+'">'+ CurTime.toLocaleString() + '     '+ TaskList[TaskItem].user +
        '   ExecTaskid：'+TaskList[TaskItem].id + '   Status：'+TaskList[TaskItem].status +
        '   Result：'+TaskList[TaskItem].result+'</a>';
    }
    this.UI.SetDOMHtmlContent('#Log_ResHandleHistory',HistoryContent);

  },

  AddResItemToList: function (itemdata) {

    var template = null;
    var Context = this;
    template = this.UI.GenerateAndParseResTemplate(this.TaskListSession,itemdata,this.Majorid,this.Minorid);
    template.click(function () {
      Context.QueryResHistory();
    });
  },

  QueryRunningLog: function(task_id){
    var ReqContent = {
      "":""
    };
    var contentTypeStr = 'application/json;charset=UTF-8';
    var urlpara = '/front/task/log/'+ task_id + '/0';

    $.ajax({
      type:"GET",
      url:urlpara,
      cache:false,
      dataType:'json',
      contentType:contentTypeStr,
      context:this,
      data:JSON.stringify(ReqContent),

      success:this.ProcessTaskLogQuery,
      error: function() {
        console.log("Get TaskId:"+task_id+" LogQuery Error!");
      }
    });
  },

  ProcessTaskLogQuery: function (TaskLog){

    if(TaskLog.result === 0 && TaskLog.message === 'success')
    {
      if(TaskLog.status === "run")
      {
        if(this.CurTimerID == undefined)
        {
          var Context = this;
          this.CurTimerID = setInterval(function () {
              Context.QueryRunningLog(Context.CurTaskId);
            }, 3000);
        }
      }
      else if(TaskLog.status === "close")
      {
        //停止定时器
        if(this.CurTimerID != undefined)
        {
          clearInterval(this.CurTimerID);
          clearInterval(this.UI.SpanFlashTimerID);
          this.CurTimerID = undefined;
          this.UI.SpanFlashTimerID = undefined;
        }

        this.TaskStatusQuery(TaskLog.task_id);
      }

      var LogSession = TaskLog.log;
      if(LogSession.length === 0)
      {
        return;
      }

      this.UI.PrintLogToLogSession(LogSession,'#log_session');
    }
  },

  TaskStatusQuery: function(task_id){
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

    success:this.ProcessTaskStatusQuery,
    error: function() {
      alert("Get TaskId:"+task_id+" LogQuery Error!");
    }
  });
},

  ProcessTaskStatusQuery:function (TaskStatus){

    if(TaskStatus.result === 0 && TaskStatus.message === 'success')
    {
      this.UI.ChangeTaskStatus(TaskStatus.task);
    }
  },

  SetChildObjProtoType: function () {
    this.UI.__proto__ = UI.prototype;
  }
};



