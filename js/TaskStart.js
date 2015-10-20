/**
 * Created by Administrator on 2015/9/15.
 */
var SpanFlashTimerID = null;

function ParseTestCaseGrpSection(ResList){

  for(var item in ResList){
    var TestCaseGrp = ResList[item];
    var template = $('<label></label>');
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

function TestCaseGrpLoaded(Type,UsrObj){

  if(UsrObj.TestCaseGrpList.length === 0){
    return;
  }

  ParseTestCaseGrpSection(UsrObj.TestCaseGrpList);

}

function ParseTaskRunningSection(TaskId){

  var template = $("#panel_module").clone();
  var CurTime = new Date();

  template.attr("id",TaskId);
  template.find("a").attr("href","#panel_TaskItem"+"_"+TaskId);
  template.find("a").text(CurTime.toLocaleString());
  template.find("div").find(".panel-body").text("正在执行用例xx");
  template.find("#panel_TaskItem_1").attr("id","panel_TaskItem"+"_"+TaskId);
  template.show(500);
  SpanFlashTimerID = setInterval(function(){ $("#"+TaskId+" span").fadeOut(500).fadeIn(500); },1000);
  $("#panel_TaskList").append(template);
}

function TaskStart(e,TaskId){

  $('#TestCaseGrp').hide(1000);
  $('#UploadFile').parent().parent().hide(1000);
  $(this).button('loading');
  ParseTaskRunningSection(TaskId);

}

function TaskEnd(e,TaskStatus){

  $('#BeginTest').button('reset');
  if(TaskStatus === undefined){
    return;
  }
  clearInterval(SpanFlashTimerID);

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
    $('#Log_TaskStatus').append((TaskLog[item].content));
  }
}

function TaskRunningLogArrive(e,TaskLog){

  ParseTaskLogSection(TaskLog.log);
}

function PageInit(){

  var ResId = $.getURLParam('ResId');
  var MajorId = $.getURLParam('MajorId');
  var MinorId = $.getURLParam('MinorId');
  var Res = new SimResource(ResId,MajorId,MinorId);
  var Usr = new UsrObj($.cookie('username'),$.cookie('xwsessionid'));

  if(ResId == null || MajorId == null || MinorId == null){
    alert('请选择测试设备');
    window.open("homepage.html","_self");
  }

  //TODO:查询设备状态和最近历史操作

  Usr.Query(TestCaseGrpLoaded,"TestCaseGrp");

  $('#BeginTest').click(function(){

    if($('#TestCaseGrp_body input:checked').val() == null){
      $('#TestCaseGrp').removeClass("panel-default").addClass("panel-danger").fadeOut(500).fadeIn(500);
      return;
    }

    Res.CreateTask();

  });

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
      var btn = $('<button/>').text('上传').attr({
        'class':'btn btn-success btn-block'
      });
      $(this).after(btn);

      $('#UploadFile_progress .progress-bar').css(
        'width', 0
      ).text('');

      data.context = btn.click(function () {
          $(this).remove();
          data.submit();
        });
    },
    done: function (e, data) {
      $('#UploadFile_progress .progress-bar').text("完成");
      data.context.text('Upload finished.');
    }
  });
}

function PageDestroy(){

}

$(document).on('DocReady',PageInit);
$(document).on('WindowDestroy',PageDestroy);
$(document).on('TaskStart',TaskStart);
$(document).on('TaskEnd',TaskEnd);
$(document).on('TaskRunningLogArrive',TaskRunningLogArrive);