/**
 * Created by Administrator on 2015/10/22.
 */

function TaskStatusHandle(TaskStatus){

  var TaskItem = null;
  var LogItem = null;
  var ResItem = null;
  var Res = null;
  var MajorId = null;
  var MinorId = null;
  var DevInfo = null;
  var MinorRes = null;
  var InfoHandler = {
    TaskInfoHandler:{
      id:function(text){
        $("#TaskId > span.badge").text(text);} ,
      status:function(text){
        if(text === "run"){
          $("#TaskStatus > span.badge").text("运行中").attr("class","badge badge-info");
          //TODO:实时展示运行步骤
        }
        else if(text === "close"){
          $("#TaskStatus > span.badge").text("完成").attr("class","badge badge-success");
        }
        else{
          $("#TaskStatus > span.badge").text("未知").attr("class","badge badge-warning");
        }
      } ,
      date:function(text){
        $("#CreateTime > span.badge").text((new Date(text)).toLocaleString());},
      user:function(text){
        $("#CreateUsr > span.badge").text(text);
      } ,
      test_group: function(text){
        $("#ExecTestGrp > span.badge").text(text);
      },
      result:function(text){
        if(text === "fail"){
          $("#ExecResult > span.badge").text("失败").attr("class","badge badge-important");
        }
        else if(text === "success"){
          $("#ExecResult > span.badge").text("成功").attr("class","badge badge-success");
        }
        else{
          $("#ExecResult > span.badge").text("未知").attr("class","badge badge-warning");
        }
      } ,
      logs:function(Log){
        if(Log.length ===0){
          return;
        }
        for(var LogItem in Log){
          if(Log.hasOwnProperty(LogItem)){
            $('#Log_TaskStatus').append((Log[LogItem]));
          }
        }
      },
      log_file:function(LogFileHref){
        if(LogFileHref==null || LogFileHref.length===0){
          $("#LogDownload").removeClass("badge-info").addClass("badge-important");
          return;
        }
        $("#LogDownload").attr("href",LogFileHref);
      },
      run_time:function(time){
        $("#RunTime > span.badge").text(time/1000+"s");
      }
      //step:null,
      //task_fail_message:null
    },
    DevInfoHandler:{
      Major:{
        major_id:function(text){
          $("#MajorId > span.badge").text(text);},
        type:function(text){
          $("#Env > span.badge").text(text);},
        name:function(text){
          $("#MajorName > span.badge").text(text);},
        ip:function(text){
          $("#IPAddr > span.badge").text(text);},
        desc:function(text){
          $("#Desc > span.badge").text(text);},
        cpu:function(text){
          $("#CPUCost > span.badge").text(text+"%");
          if(parseInt(text) > 60){
            $("#CPUCost > span.badge").attr("class","badge badge-warning")
          }
        },
        mem:function(text){
          $("#MemCost > span.badge").text(text+"%");
          if(parseInt(text) > 60){
            $("#MemCost > span.badge").attr("class","badge badge-warning")
          }
        },
        uptime:function(text){
          $("#PowerOnTime > span.badge").text(text+"s");
        },
        hostname:function(text){
          $("#HostName > span.badge").text(text);
        },
        platfrom:function(text){
          $("#OpeType > span.badge").text(text);
        },
        register_date:function(text){
          $("#RegisterTime > span.badge").text((new Date(text)).toLocaleString());
        },
        status:function(text){
          if(text === "lost"){
            $("#MajorStatus > span.badge").text("失联").attr("class","badge badge-important");
          }
          else if(text === "normal"){
            $("#MajorStatus > span.badge").text("正常").attr("class","badge badge-success");
          }

        }
      },
      Minor:{
        enbID:function(text){
          $("#EnbID > span.badge").text(text);
        },
        enbName:function(text){
          $("#EnbName > span.badge").text(text);
        },
        epcip:function(text){
          $("#EpcIp > span.badge").text(text);
        },
        ip:function(text){
          $("#LocalIp > span.badge").text(text);
        },
        minor_id:function(text){
          $("#MinorId > span.badge").text(text);
        },
        pdnip:function(text){
          $("#PdnIp > span.badge").text(text);
        },
        status:function(text){
          if(text === "idle"){
            $("#MinorStatus > span.badge").text("空闲").attr("class","badge badge-success");
          }
          else if(text === "busy"){
            $("#MinorStatus > span.badge").text("运行").attr("class","badge badge-warning");
          }
        }
      }

    }
  };

  if(TaskStatus.task.resource.major_id !=null && TaskStatus.task.resource.minor_id !=null){
    MajorId = parseInt(TaskStatus.task.resource.major_id);
    MinorId = parseInt(TaskStatus.task.resource.minor_id);
  }
  else{
    console.log("resource id error,MajorId ="+TaskStatus.task.resource.major_id+" ,MinorId = "+TaskStatus.task.resource.minor_id);

  }

  for(TaskItem in TaskStatus.task){
    if(TaskStatus.task.hasOwnProperty(TaskItem) && InfoHandler.TaskInfoHandler.hasOwnProperty(TaskItem)){
      InfoHandler.TaskInfoHandler[TaskItem](TaskStatus.task[TaskItem]);
    }
  }

  //处理设备信息
  DevInfo = JSON.parse(TaskStatus.task.resource_snapshot);
  for(ResItem in DevInfo){
    if(DevInfo.hasOwnProperty(ResItem) && InfoHandler.DevInfoHandler.Major.hasOwnProperty(ResItem)){
      InfoHandler.DevInfoHandler.Major[ResItem](DevInfo[ResItem]);
    }
  }
  MinorRes = DevInfo.sub_resource[MinorId - 1];
  if(MinorRes ==null || MinorRes.length===0){
    console.log("MajorId="+DevInfo.major_id+"MinorId="+MinorId+"Has no Minor Information");
    return;
  }

  for(ResItem in MinorRes){
    if(MinorRes.hasOwnProperty(ResItem) && InfoHandler.DevInfoHandler.Minor.hasOwnProperty(ResItem)){
      InfoHandler.DevInfoHandler.Minor[ResItem](MinorRes[ResItem]);
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