/**
 * Created by Administrator on 2015/9/15.
 */
//模拟设备资源类
function SimResource(Index,Majorid,Minorid)
{
  this.Index = Index;
  this.Majorid = Majorid;
  this.Minorid = Minorid;
  this.UI = new UI(Index);
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
      "type":"Simulation",
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

  QueryResHistory:function(Type,IdIndex){
    //请求历史操作Log
    var ReqContent = {
      "":""
    };
    var contentTypeStr = 'application/json;charset=UTF-8';
    var Res = null;
    var urlpara = '';

    if(Type === 'Simulation')
    {
      Res = this.SimResArray[IdIndex];
    }
    else if(Type === 'Real')
    {
      Res = this.RealResArray[IdIndex];
    }
    else
    {
      console.log('Unknow Resource Type:'+Type);
      return;
    }

    if(Res == null)
    {
      console.log('No Such Resource Id = '+IdIndex);
    }
    urlpara = '/front/task/list?major_id='+ Res.GetMajorId() +'&minor_id='+Res.GetMinorId();

    $.ajax({
      type:"GET",
      url:urlpara,
      cache:false,
      dataType:'json',
      contentType:contentTypeStr,
      data:JSON.stringify(ReqContent),

      success:this.ProcessQueryResHandleHistory,
      error: function() {
        alert("QueryHistoryLog Error!");
      }
    });

  },

  ProcessQueryResHandleHistory:function(ResHandleHistory){
    var HistoryContent = '';
    var TaskList = ResHandleHistory.task;
    var CurTime = null;

    UI.prototype.ClearDOMTextContent('#Log_ResHandleHistory');
    if(TaskList.length === 0)
    {
      return;
    }

    for(var TaskItem in TaskList)
    {
      CurTime = new Date(TaskList[TaskItem].date);
      HistoryContent += '<h5 style="white-space:pre">'+ CurTime.toLocaleString() + '     '+ TaskList[TaskItem].user +
        '   ExecTaskid：'+TaskList[TaskItem].id + '   Status：'+TaskList[TaskItem].status +
        '   Result：'+TaskList[TaskItem].result+'</h5>';
    }
    UI.prototype.SetDOMHtmlContent('#Log_ResHandleHistory',HistoryContent);

  },

  AddResItemToList: function (Ele) {
    var template = null;

    template = this.UI.GenerateAndParseResTemplate(Ele,this.Index);
    this.UI.AddHandlerToEvent(template,'click',this.QueryResHistory('Simulation',this.Index));
  },

  QueryRunningLog: function (task_id){
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
          this.CurTimerID = setInterval(function(){ this.QueryRunningLog(TaskLog.task_id);}, 3000);
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

      var LogSession = data.log;
      if(LogSession.length === 0)
      {
        return;
      }
      if(data.current_log_id.toString() === LogSession[LogSession.length - 1].id)
      {
        return;
      }
      else
      {
        this.UI.PrintLogToLogSession(LogSession,'#log_session');
      }

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
  }
};



