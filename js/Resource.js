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

      success:function (TaskInfo) {

        if(TaskInfo.result === 0 && TaskInfo.message === 'success'){
          this.CurTaskId = TaskInfo.task_id;
          $(document).triggerHandler('TaskStart',[this.CurTaskId]);
          this.QueryRunningLog(this.CurTaskId);
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
      HistoryContent += '<a style="white-space:pre" href="'+TaskList[TaskItem].log_file+'">'+ CurTime.toLocaleString() + '     '+ TaskList[TaskItem].user +
        '   ExecTaskid：'+TaskList[TaskItem].id + '   Status：'+TaskList[TaskItem].status +
        '   Result：'+TaskList[TaskItem].result+'</a>';
    }

    for(TaskItem_Hide = TaskItem,max = TaskList.length; TaskItem_Hide < max;TaskItem_Hide++){
      CurTime = new Date(TaskList[TaskItem_Hide].date);
      HistoryContent_Hide += '<a style="white-space:pre" href="'+TaskList[TaskItem_Hide].log_file+'">'+ CurTime.toLocaleString() + '     '+ TaskList[TaskItem_Hide].user +
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
      else if(TaskLog.status === "close"){

        //停止轮询Log定时器
        if(this.CurTimerID != undefined)
        {
          clearInterval(this.CurTimerID);
          this.CurTimerID = undefined;
        }

        this.TaskStatusQuery(TaskLog.task_id);
      }

      if(TaskLog.log.length === 0){
        return;
      }

      $(document).triggerHandler('TaskRunningLogArrive',TaskLog);
      //this.UI.PrintLogToLogSession(TaskLog.log,'#Log_TaskStatus');
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

    success:function (TaskStatus){

      if(TaskStatus.result === 0 && TaskStatus.message === 'success'){
        $(document).triggerHandler('TaskEnd',[TaskStatus.task]);
      }
      else{
        $(document).triggerHandler('TaskEnd',[TaskStatus.task]);
        console.log('TaskStatus Query Result not successed,Taskid:' + task_id);
      }
    },
    error: function() {
      console.log("Get TaskId:"+task_id+" LogQuery Error!");
    }
  });
}


};



