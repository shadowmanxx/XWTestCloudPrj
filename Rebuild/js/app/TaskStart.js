/**
 * Created by Administrator on 2015/9/15.
 */


define(function(require){
  var SimRes = require("obj/SimResourceObj"),
      Usr = require("obj/UserObj"),
      $ = require('jquery');
  require("jquery_getParams");
  require("jquery_fileupload");
  require("bootstrap");

  $(function(){
    var ResId = $.getURLParam('ResId'),
        MajorId = $.getURLParam('MajorId'),
        MinorId = $.getURLParam('MinorId'),
        Res = new SimRes({ID:ResId,major_id:MajorId,minor_id:MinorId}),
        TestGrpId = "",
        UpLoadSuccessFlag = false,
        CreateTaskPara = {
        TestGrpName:"",
        UpLoadPath : {
          lte_app:"",
          lte_db:""
        }
      };
    if(ResId == null || MajorId == null || MinorId == null){
      alert('请选择测试设备');
      window.open("homepage.html","_self");
    }

    //TODO:查询设备状态和最近历史操作

    Usr.Query(TestCaseGrpLoaded,"TestCaseGrp");

    $('#BeginTest').click(function(){
      var TestCaseGrpList = null;

      if($('#TestCaseGrp_body input:checked').val() == null){
        $('#TestCaseGrp').removeClass("panel-default").addClass("panel-danger").fadeOut(500).fadeIn(500);
        return;
      }
      else if(UpLoadSuccessFlag === false){
        $("#TestCaseGrp").next().removeClass("panel-default").addClass("panel-danger").fadeOut(500).fadeIn(500);
        return;
      }
      else{
        TestGrpId = $('#TestCaseGrp_body input:checked').attr("id");
        TestGrpId = TestGrpId.slice(TestGrpId.indexOf("_")+1);
        TestCaseGrpList = Usr.GetTestCaseGrpList();
        CreateTaskPara.TestGrpName = TestCaseGrpList[TestGrpId].Name;
      }
      Res.CreateTask(CreateTaskPara,CreateTaskHandle);
      UpLoadSuccessFlag = false;
    });

    (function(){
      var FileOperationList = {
        lte_app:null,
        lte_db:null
      };
      var UpLoadedFiles = 1;
      $('#UploadFile').fileupload({
        //dataType: 'json',
        progressall: function (e, data) {
          var progress = parseInt(data.loaded / data.total * 100, 10);
          $('#UploadFile_progress .progress-bar').css(
            'width',
            progress + '%'
          );
        },
        add: function (e, data) {
          var FileList = data.originalFiles;
          var btn = $('<button/>').text('上传').attr({
            'class':'btn btn-success btn-block',
            "id":"UpLoadBtn"
          });
          var TextLabel = $("<p/>");
          var contentLabel = $("<span/>");
          var RemoveBtn = $('<button type="button" class="btn btn-default btn-xs remove"><span class="glyphicon glyphicon-trash"></span></button>');
          var CurFileName = data.files[0].name;
          //当前文件是要找的文件
          if(CurFileName === "lte_app" ){
            if(FileOperationList.lte_app === null){
              contentLabel.text("lte_app");
              TextLabel.attr("id","lte_app").append(RemoveBtn).append(contentLabel);
              RemoveBtn.click(function(){
                $(this).parents("p").remove();
                FileOperationList.lte_app = null;
                $("#UpLoadBtn").remove();
              });
              $("#UploadFile").after(TextLabel);

            }
            else{
              $(this).nextAll("#lte_app").toggleClass("text-warning").fadeOut(500).fadeIn(500);
              return;
            }
            FileOperationList.lte_app = data;
          }
          else if(CurFileName === "lte.db"){
            if(FileOperationList.lte_db === null){
              contentLabel.text("lte.db");
              TextLabel.attr("id","lte_db").append(RemoveBtn).append(contentLabel);
              RemoveBtn.click(function(){
                $(this).parents("p").remove();
                FileOperationList.lte_db = null;
                $("#UpLoadBtn").remove();
              });
              $("#UploadFile").after(TextLabel);
            }
            else{
              $(this).nextAll("#lte_db").toggleClass("text-warning").fadeOut(500).fadeIn(500);
              return;
            }
            FileOperationList.lte_db = data;
          }
          //已有上传按钮，说明刚刚上传完毕，添加文件后删除上传按钮和进度条
          if($("#UploadFile_progress").prevAll("button").length !==0){
            $("#UpLoadBtn").remove();
            $('#UploadFile_progress .progress-bar').css(
              'width', 0
            ).text('');
            $('#UploadFile_progress').hide();
          }
          //当前文件是文件列表的最后一个文件
          if(CurFileName === FileList[FileList.length-1].name){
            for(var item in FileOperationList){
              if(FileOperationList.hasOwnProperty(item) && FileOperationList[item] === null){
                alert("请选择"+item);
                return;
              }
            }

            $("#UploadFile_progress").before(btn);
            btn.click(function () {
              FileOperationList.lte_app.submit();
              FileOperationList.lte_db.submit();
              $('#UploadFile_progress').show();
              $(this).attr("disabled","disabled").text('正在上传');
            });

          }
        },
        done: function (e, data) {
          if(UpLoadedFiles === 2){
            $('#UploadFile_progress .progress-bar').text("100%");
            $("#UpLoadBtn").fadeOut(1000,function(){
              $(this).text("lte_app lte.db 上传成功");
            }).fadeIn(1000,function(){
              $("#UploadFile").nextAll("p").remove();
              FileOperationList.lte_app = null;
              FileOperationList.lte_db = null;
              UpLoadedFiles = 1;
              UpLoadSuccessFlag = true;
            });
          }
          UpLoadedFiles+=1;
          switch (data.files[0].name){
            case "lte.db":
              CreateTaskPara.UpLoadPath.lte_db = data.result.file;
              break;
            case "lte_app":
              CreateTaskPara.UpLoadPath.lte_app = data.result.file;
              break;
            default :
              break;
          }
        }
      });
    }());


  });

  function ParseTestCaseGrpSection(ResList){
    var TestCaseGrp = null;
    var template = $('<label></label>');

    for(var item in ResList){
      if(ResList.hasOwnProperty(item)){
        TestCaseGrp = ResList[item];
        template.attr('for','TestCaseGrp_'+TestCaseGrp.ID);
        template.html('<input>'+TestCaseGrp.Name);
        template.children().attr({
          'type':'radio',
          'name':'TestCaseGrp',
          'value':TestCaseGrp.ID,
          'ID':'TestCaseGrp_'+TestCaseGrp.ID
        });

        $('#TestCaseGrp_body').append(template);
      }
    }
  }

  function TestCaseGrpLoaded(Type,ResList){
    if(ResList ==null){
      console.log("ResList Error");
      return;
    }

    ParseTestCaseGrpSection(ResList);
  }

  function ParseTaskRunningSection(TaskId){

    var template = $("#panel_module").clone();
    var CurTime = new Date();
    var SpanFlashTimerID = null;
    template.attr("id",TaskId);
    template.find("a").text(CurTime.toLocaleString()).attr("href","#panel_TaskItem"+"_"+TaskId);
    template.find("div").find(".panel-body").text("正在执行用例xx");
    template.find("#panel_TaskItem_1").attr("id","panel_TaskItem"+"_"+TaskId);
    template.show(500);
    SpanFlashTimerID = setInterval(function(){ $("#"+TaskId+" span").fadeOut(500).fadeIn(500); },1000);
    $("#panel_TaskList").append(template);

    return SpanFlashTimerID;
  }

  function TaskEndHandle(TaskStatusRes){
    var TaskStatus = TaskStatusRes.task;
    $('#BeginTest').button('reset');
    if(TaskStatusRes.result === 0 && TaskStatusRes.message === 'success'){
      $('#TestCaseGrp').show(1000);
      $('#UploadFile').parent().parent().show(1000);
      $("#UpLoadBtn").remove();
      $('#UploadFile_progress .progress-bar').css(
        'width', 0
      ).text('');
      $('#UploadFile_progress').hide();
    }
    else{
      console.log('TaskStatus Query Result not successed,Taskid:' + TaskStatusRes.task_id);
    }
    if(TaskStatus === undefined){
      return;
    }

    if(TaskStatus.result === "fail"){
      $("#" + TaskStatus.id + " span").text("失败");
      $("#" + TaskStatus.id).attr("class","panel panel-danger");
      $("#" + TaskStatus.id + " span").attr("class","badge badge-important pull-right");
    }
    else if(TaskStatus.result === "success"){
      $("#" + TaskStatus.id + " span").find('span').text("成功");
      $("#" + TaskStatus.id).attr("class","panel panel-success");
      $("#" + TaskStatus.id + " span").find('span').attr("class","badge badge-success pull-right");
    }
    else{
      console.log('Unknown TaskStatus Result: '+ TaskStatus.result);
    }
  }

  function ParseTaskLogSection(TaskLog){

    for(var item in TaskLog){
      if(TaskLog.hasOwnProperty(item)){
        $('#Log_TaskStatus').append((TaskLog[item].content));
      }
    }
    if(parseInt(item) === TaskLog.length - 1){
      return TaskLog.length;
    }
    else{
      //错误处理
    }
  }

  function CreateTaskHandle(TaskStatus){
    var CurTaskId = TaskStatus.task_id;
    var NextLogId = 0;
    var CurTimerID = null;
    var TaskUITimer = null;
    if(CurTaskId ==null || CurTaskId.length ===0){
      return null;
    }

    $('#TestCaseGrp').hide(1000);
    $('#UploadFile').parent().parent().hide(1000);
    $("#BeginTest").button('loading');
    TaskUITimer = ParseTaskRunningSection(CurTaskId);

    return function TaskLogHandler(TaskLog,Res){

      if(TaskLog.log.length !== 0){
        NextLogId = ParseTaskLogSection(TaskLog.log);
      }

      if(TaskLog.status === "run"){
        if(CurTimerID ===null){
          CurTimerID = setInterval(function () {
            Res.QueryRunningLog(TaskLogHandler,CurTaskId,NextLogId);
          }, 3000);
        }
        else if(NextLogId !== TaskLog.current_log_id){
          clearInterval(CurTimerID);
          CurTimerID = setInterval(function () {
            Res.QueryRunningLog(TaskLogHandler,CurTaskId,NextLogId);
          }, 3000);
        }
      }
      else if(TaskLog.status === "close"){
        //停止轮询Log定时器
        if(CurTimerID !== null)
        {
          clearInterval(CurTimerID);
          CurTimerID = null;
        }
        if(TaskUITimer !== null)
        {
          clearInterval(TaskUITimer);
          TaskUITimer = null;
        }
        Res.TaskStatusQuery(TaskLog.task_id,TaskEndHandle);


      }



    }
  }

});