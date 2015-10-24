/**
 * Created by Administrator on 2015/10/22.
 */




function TaskStatusHandle(TaskStatus){

  var TaskItem = null;
  var LogItem = null;
  var Res = null;
  var MajorId = null;
  var MinorId = null;
  var Info = {
    TaskInfo:{
      id:$("#TaskId > span.badge"),
      status:$("#TaskStatus > span.badge"),
      date:$("#CreateTime > span.badge"),
      user:$("#CreateUsr > span.badge"),
      test_group:$("#ExecTestGrp > span.badge"),
      result:$("#ExecResult > span.badge"),
      logs:$("#Log_TaskStatus")
      //step:null,
      //task_fail_message:null
    },
    DevInfo:{
      Major:{
        major_id:$("#MajorId > span.badge"),
        type:$("#Env > span.badge"),
        name:$("#MajorName > span.badge"),
        ip:$("#IPAddr > span.badge"),
        desc:$("#Desc > span.badge"),
        cpu:$("#CPUCost > span.badge"),
        mem:$("#MemCost > span.badge"),
        uptime:$("#PowerOnTime > span.badge"),
        hostname:$("#HostName > span.badge"),
        platfrom:$("#OpeTime > span.badge"),
        register_date:$("#RegisterTime > span.badge"),
        status:$("#MajorStatus > span.badge")
      },
      Minor:{
        enbID:$("#EnbID > span.badge"),
        enbName:$("#EnbName > span.badge"),
        epcip:$("#EpcIp > span.badge"),
        ip:$("#LocalIp > span.badge"),
        minor_id:$("#MinorId > span.badge"),
        pdnip:$("#PdnIp > span.badge"),
        status:$("#MinorStatus > span.badge")
      }

    }
  };
  var Log = null;

  if(TaskStatus.task.resource.major_id !=null && TaskStatus.task.resource.minor_id !=null){
    MajorId = parseInt(TaskStatus.task.resource.major_id);
    MinorId = parseInt(TaskStatus.task.resource.minor_id);
    Res = new SimResource(0,MajorId ,MinorId);
    Res.QueryInfo(ResHandle);
  }

  for(TaskItem in TaskStatus.task){
    if(TaskStatus.task.hasOwnProperty(TaskItem) && Info.TaskInfo.hasOwnProperty(TaskItem)){
      Info.TaskInfo[TaskItem].text(TaskStatus.task[TaskItem]);
    }
  }
  //修改任务相关标签展示
  if(Info.TaskInfo.result.text() === "fail"){
    Info.TaskInfo.result.attr("class","badge badge-important");
  }
  $("#DownloadLog").attr("href",TaskStatus.task.log_file);

  Log = Info.TaskInfo.logs;
  for(LogItem in Log){
    if(Log.hasOwnProperty(LogItem)){
      $('#Log_TaskStatus').append((Log[LogItem].content));
    }
  }

  function ResHandle(DevInfo,MinorId){
    var ResItem = null;
    var MinorRes = null;

    for(ResItem in DevInfo){
      if(DevInfo.hasOwnProperty(ResItem) && Info.DevInfo.Major.hasOwnProperty(ResItem)){
        Info.DevInfo.Major[ResItem].text(DevInfo[ResItem]);
      }
    }

    MinorRes = DevInfo.sub_resource[MinorId - 1];
    if(MinorRes ==null || MinorRes.length===0){
      console.log("MajorId="+DevInfo.major_id+"MinorId="+MinorId+"Has no Minor Information");
      return;
    }

    for(ResItem in MinorRes){
      if(MinorRes.hasOwnProperty(ResItem) && Info.DevInfo.Minor.hasOwnProperty(ResItem)){
        Info.DevInfo.Minor[ResItem].text(MinorRes[ResItem]);
      }
    }
  }
}


function PageInit(){

  var TaskId = $.getURLParam('TaskId');

  if(TaskId === null){
    alert('请选择任务');
    window.open("homepage.html","_self");
  }

  //TODO:查询设备状态和最近历史操作
  $("#MajorId").parent().popover({
    'trigger':'click hover'
  });
  SimResource.prototype.TaskStatusQuery(TaskId,TaskStatusHandle);

}



$(document).on('DocReady',PageInit);