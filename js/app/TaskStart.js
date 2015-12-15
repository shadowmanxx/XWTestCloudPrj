/**
 * Created by Administrator on 2015/9/15.
 */


define(function(require){
  var SimRes = require("obj/SimResourceObj"),
      RealRes = require("obj/RealResourceObj"),
      Usr = require("obj/UserObj"),
      $ = require('jquery');

  require("jquery_getParams");
  require("jquery_fileupload");
  require("bootstrap");
  require("bootstrap-table");
  require("jquery_tinyscrollbar");

  var ResId = $.getURLParam('ResId'),
      ResType = $.getURLParam('ResType'),
      MajorId = $.getURLParam('MajorId'),
      MinorId = $.getURLParam('MinorId'),
      common = require('common/common');

  Usr.Query(TestCaseGrpLoaded,"TestCaseGrp");

  $(function(){
    var Res = null,
        UpLoadSuccessFlag = false,
        CellSelectorDOM = [ $("#CellSelector input:eq(0)"),
                            $("#CellSelector input:eq(1)"),
                            $("#CellSelector input:eq(2)")],
        EIInfoDOM = {
          CellInfo:{
            GenericCfg:{
              u32EnbId:$("#eNBID"),
              u8CellID:$("#CellID"),
              u32CellCenterFreq:$("#CenterFreq"),
              u16CellPCI:$("#PCI"),
              u8CellBandWidth:$("#BandWidth"),
              u8CellULDLConfig:$("#UlDlCfg"),
              u8CellSpecSubFramCfg:$("#SpecSFCfg"),
              u8CellULAntNum:$("#UlAntNum"),
              u8CellDLAntNum:$("#DlAntNum")
            },
            GeneralState:{
              u16SFN:$("#SFN"),
              u16ActiveUENum:$("#ActiveUENum"),
              ConnectUENum:$("#ConnectUENum"),
              s16NI:$("#NI"),
              u8TXPower:$("#TXPower")
            },
            DetailState_Ul:{
              u32ULMacThrput:$("#ULMacThrput"),
              u32ULPdcpThrput:$("#UlPdcpThrput"),
              u8ULRbRatio:$("#ULRbRatio"),
              u8ULAvrgShdUEForTTI:$("#ULAvrgShdUEPerTTI"),
              u8ULAvrgHarqCnt:$("#ULAvrgHarqCnt"),
              u8ULAvrgBler:$("#ULAvrgBler"),
              u16ULHarqFailRatio:$("#ULHarqFailRatio"),
              u16ULHarqExpireRatio:$("#ULHarqExpireRatio"),
              u16ULAvrgMcs:$("#ULAvrgMcs"),
              u16ULMaxSchdMcs:$("#ULMaxSchdMcs"),
              u16ULHqRetSuccRate1:$("#UlHqRetSuccRatio1"),
              u16ULHqRetSuccRate2:$("#UlHqRetSuccRatio2"),
              u16ULHqRetSuccRate3:$("#UlHqRetSuccRatio3"),
              u16ULHqRetSuccRate4:$("#UlHqRetSuccRatio4")
            },
            DetailState_Dl:{
              u32DLMacThrput:$("#DLMacThrput"),
              u32DLPdcpThrput:$("#DlPdcpThrput"),
              u8DLRbRatio:$("#DLRbRatio"),
              u8DLAvrgShdUEForTTI:$("#DLAvrgShdUEPerTTI"),
              u8DLAvrgHarqCnt:$("#DLAvrgHarqCnt"),
              u8DLAvrgBler:$("#DLAvrgBler"),
              u16DLHarqFailRatio:$("#DLHarqFailRatio"),
              u16DLHarqExpireRatio:$("#DLHarqExpireRatio"),
              u16DLAvrgMcs:$("#DLAvrgMcs"),
              u16DtxRatio:$("#DtxRatio"),
              u8TXDivTMRatio:$("#TXDivTMRatio"),
              u8TxCddRatio:$("#TxCddRatio"),
              u16DLMaxSchdMcs:$("#DLMaxSchdMcs"),
              u16DLHqRetSuccRatio1:$("#DlHqRetSuccRatio1"),
              u16DLHqRetSuccRatio2:$("#DlHqRetSuccRatio2"),
              u16DLHqRetSuccRatio3:$("#DlHqRetSuccRatio3"),
              u16DLHqRetSuccRatio4:$("#DlHqRetSuccRatio4")
            }
          },
          UEInfo:{
            u8PL:"PL",
            u8TxDivRatio:"TXDiv",
            ueGid:"GID",
            u32ULPdcpThrput:"UlPdcpTput",
            u32DLPdcpThrput:"DlPdcpTput",
            u32IP:"IP",
            u32ULMacThrput:"UlMacTput",
            u32DLMacThrput:"DlMacTput",
            u16ULSchdCnt:"UlShdCnt",
            u16DLSchdCnt:"DlShdCnt",
            u16ULHarqFailRatio:"UlHarqFail",
            u16DLHarqFailRatio:"DlHarqFail",
            u16ULHarqExpireRatio:"UlHarqExpire",
            u16DLHarqExpireRatio:"DlHarqExpire",
            u16ULAvrgMcs:"UlMcs",
            u16DLAvrgMcs:"DlMcs",
            u8ULAvrgHarqTxCnt:"UlHarqCnt",
            u8DLAvrgHarqTxCnt:"DlHarqCnt",
            u16ULAvrgRbNum:"UlRbNum",
            u16DLAvrgRbNum:"DlRbNum",
            u8ULAvrgBler:"UlBler",
            u8DLAvrgBler:"DlBler",
            u16DtxRatio:"DTX"
          }
        },
        VerSubmitObj = null;

    if(ResType == null || ResId == null || MajorId == null){
      alert('请选择测试设备');
      window.open("homepage.html","_self");
    }

    VerSubmitObj = ModifySubmitObject(ResType,false);

    if(ResType === "Real"){
      Res = new RealRes({ID:ResId,major_id:MajorId});
    }
    else if(ResType === "Sim"){
      Res = new SimRes({ID:ResId,major_id:MajorId,minor_id:MinorId});
      $("#FileUploadSection blockquote .text-info").text("请选择lte_app lte.db").next().text("临时版本").append($("<cite/>").text("lte_app lte.db"));
    }

    TestEI();

    $("#VerUploadType").change(function(e){
      switch (e.target.selectedIndex){
        //文件上传
        case 1:
          $("#URLInputSection").hide();
          $("#FileUploadSection").show(1000);
          break;
        case 2:
          $("#FileUploadSection").hide();
          $("#URLInputSection").show(1000);
          break;
      }
    });

    $("#Log_TaskStatus").tinyscrollbar();

    $('#BeginTest').click(function(){
      var TestCaseGrpList = null,
          URLContent = $.trim($("#URLInputSection input").val()),
          SubmitPara = {TestGrpName:"",VerSubmitObj:{}},
          UploadType = $("#VerUploadType").children("option:selected").index();

      if($('#TestCaseGrpSection_body input:checked').val() == null){
        $('#TestCaseGrpSection').removeClass("panel-default").addClass("panel-danger").fadeOut(500).fadeIn(500);
        return;
      }
      else if(UploadType ===0){
        $("#VerSelectSection").removeClass("panel-default").addClass("panel-danger").fadeOut(500).fadeIn(500);
        return;
      }
      else if(UploadType===1){
        if(UpLoadSuccessFlag === false){
          $("#VerSelectSection").removeClass("panel-default").addClass("panel-danger").fadeOut(500).fadeIn(500);
          return;
        }
        UpLoadSuccessFlag = false;

      }
      else if(UploadType===2){
        var IsValidURL = (URLContent.indexOf("ftp://") ===0);
        if(IsValidURL != true){
          $("#URLInputSection .input-group").toggleClass("has-error",true);
          $("#VerSelectSection").removeClass("panel-default").addClass("panel-danger").fadeOut(500).fadeIn(500);
          return;
        }
        else{
          $("#URLInputSection .input-group").toggleClass("has-error",false);
          VerSubmitObj = ModifySubmitObject(ResType,true);
          VerSubmitObj.url = URLContent;
          $("#URLInputSection input").val("");
        }
      }


      FillSubmitPara(SubmitPara,VerSubmitObj);

      Res.CreateTask(SubmitPara,CreateTaskHandle);

      function FillSubmitPara(SubmitPara,SrcVerSubmitPara){
        var TestGrpId = null;

        TestGrpId = $('#TestCaseGrpSection_body input:checked').attr("id");
        TestGrpId = TestGrpId.slice(TestGrpId.indexOf("_")+1);
        TestCaseGrpList = Usr.GetTestCaseGrpList();
        SubmitPara.TestGrpName = TestCaseGrpList[TestGrpId].Name;

        for(var item in SrcVerSubmitPara){
          if(SrcVerSubmitPara.hasOwnProperty(item)){
            switch (item){
              case "lte_app":
                SubmitPara.VerSubmitObj.exe_file = SrcVerSubmitPara[item];
                break;
              case "lte_db":
                SubmitPara.VerSubmitObj.db_file = SrcVerSubmitPara[item];
                break;
              case "bin":
                SubmitPara.VerSubmitObj.exe_file = SrcVerSubmitPara[item];
                break;
              case "url":
                SubmitPara.VerSubmitObj.url = SrcVerSubmitPara[item];
                break;
              default :
                break;
            }
          }

        }
    }

    });

    (function(){
      var FileOperationList = $.extend(true,{},VerSubmitObj),
          UpLoadedFiles = 0;
      function GenerateFileSection(CurFileName,FileOperationList){
        var TextLabel = null,
            FillPara = null,
            LabelId = "",
            RemoveBtn = $('<button type="button" class="btn btn-default btn-xs remove"><span class="glyphicon glyphicon-trash"></span></button>');

        if(CurFileName === "lte_app" ){
          FillPara = FileOperationList.lte_app;
          LabelId = "lte_app";
        }
        else if(CurFileName === "lte.db" ){
          FillPara = FileOperationList.lte_db;
          LabelId = "lte_db";
        }
        else{
          FillPara = FileOperationList.bin;
          LabelId = "bin";
        }

        if(FillPara !==null){
          InfoFileChange(LabelId);
          return;
        }

        TextLabel = $("<p/>").attr("id",LabelId).append(RemoveBtn).append($("<span/>").text(CurFileName));
        (function(LabelId){
          RemoveBtn.click(function(){
            $(this).parents("p").remove();
            FileOperationList[LabelId] = null;
            $("#UpLoadBtn").remove();
          });
        }(LabelId));

        $("#UploadFile").after(TextLabel);
      }
      function InfoFileChange(Id){
        $("#"+Id).toggleClass("text-warning").fadeOut(500).fadeIn(500)
      }

      $('#UploadFile').fileupload({
        progressall: function (e, data) {
          var progress = parseInt(data.loaded / data.total * 100, 10);
          $('#UploadFile_progress .progress-bar').css(
            'width',
            progress + '%'
          );
        },
        add: function (e, data) {
          var FileList = data.originalFiles,
              CurFileName = data.files[0].name,
              btn = $('<button/>').text('上传').attr({
                'class':'btn btn-success btn-block',
                "id":"UpLoadBtn"
              });

          if(ResType === "Real"){
            var IsValidBinFile = (CurFileName.search(/.BIN$/g) !==-1);

            if(IsValidBinFile){
              GenerateFileSection(CurFileName,FileOperationList);
              FileOperationList.bin = data;
            }
          }
          else if(ResType === "Sim"){
            if(CurFileName === "lte_app" ){
              GenerateFileSection(CurFileName,FileOperationList);
              FileOperationList.lte_app = data;
            }
            else if(CurFileName === "lte.db"){
              GenerateFileSection(CurFileName,FileOperationList);
              FileOperationList.lte_db = data;
            }
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
              for(var item in FileOperationList){
                if(FileOperationList.hasOwnProperty(item)){
                  FileOperationList[item].submit();
                }
              }
              $('#UploadFile_progress').show();
              $(this).attr("disabled","disabled").text('正在上传');
            });

          }
        },
        done: function (e, data) {
          var SucceedInfo = "";

          if(ResType === "Real"){
            VerSubmitObj.bin = data.result.file;
            SucceedInfo = "版本包上传成功";
            UpLoadedFiles = 2;
          }
          else if(ResType === "Sim"){
            SucceedInfo = "lte_app lte.db 上传成功";
            UpLoadedFiles+=1;

            switch (data.files[0].name){
              case "lte.db":
                VerSubmitObj.lte_db = data.result.file;
                break;
              case "lte_app":
                VerSubmitObj.lte_app = data.result.file;
                break;
              default :
                break;
            }

          }
          if(UpLoadedFiles === 2){
            $('#UploadFile_progress .progress-bar').text("100%");
            $("#UpLoadBtn").fadeOut(500,function(){
              $(this).text(SucceedInfo);
            }).fadeIn(500,function(){
              $("#UploadFile").nextAll("p").remove();
              for(var item in FileOperationList){
                if(FileOperationList.hasOwnProperty(item)){
                  FileOperationList[item] = null;
                }
              }
              UpLoadedFiles = 0;
              UpLoadSuccessFlag = true;
            });
          }


        }
      });
    }());

    function TestEI(taskid){
      var CurEIData = null,
        TimerInterval = 1000,
        CellId = null;

      $.ajax({
        type:"GET",
        url:"/front/task/eibasic/"+taskid,
        cache:false,
        dataType:'json',
        contentType:'application/json;charset=UTF-8',
        success:function(Result){
          if(Result.result !==0){
            alert(Result.message);
            return;
          }

          CurEIData = Result.ei_basic;
          InitEICellInfo(CurEIData);
          CellId = $("#CellSelector input:checked").value();
          UpdateEIData(CurEIData[CellId]);

          setInterval(function(){
            $.ajax({
              type:"GET",
              url:"/front/task/eibasic/"+taskid,
              cache:false,
              dataType:'json',
              contentType:'application/json;charset=UTF-8',
              success:function(Result){
                if(Result.result !==0){
                  alert(Result.message);
                  return;
                }

                CurEIData = Result.ei_basic;
                InitEICellInfo(CurEIData);
                UpdateEIData(CurEIData[CellId]);
              },
              error: function() {
                console.log("QueryEiBasicInfo Error!");
              }
            });
          },TimerInterval);
        },
        error: function() {
          console.log("QueryEiBasicInfo Error!");
        }
      });

      $("#CellSelector input").change(function(e){
        CellId = e.currentTarget.value;

        UpdateEIData(CurEIData[CellId]);


      });
    }

    function InitEICellInfo(EiData){
      var Index = 0,
          DisableIndx = 0;

      for(var CellId in EiData){
        if(EiData.hasOwnProperty(CellId)){
          CellSelectorDOM[Index].value(CellId).parent().removeAttr("disabled");
          Index++;
        }
      }
      for(DisableIndx = Index;DisableIndx < 3;DisableIndx++){
        CellSelectorDOM[Index].attr("disabled","disabled");
      }

    }

    function UpdateEIData(CellEiInfo){
      if(CellEiInfo==null){
        console.log("No CellId EIInfo");
        return;
      }

      UpdateCellGeneralCfg(CellEiInfo.cellGeneralCfg);
      UpdateCellGeneralState(CellEiInfo.cellGeneralState);
      UpdateCellDetailStateUl(CellEiInfo.cellULDetailState);
      UpdateCellDetailStateDl(CellEiInfo.cellDLDetailState);
      UpdateUeInfo(CellEiInfo.ueGeneralList.ueDict);


      function UpdateCellGeneralCfg(Cfg){
        var GenericCfgDOM = EIInfoDOM.CellInfo.GenericCfg;

        if(Cfg==null||Cfg.length ===0){
          console.log("GeneralConfig does not exists");
          return;
        }
        for(var CfgItem in Cfg){
          if(Cfg.hasOwnProperty(CfgItem) && GenericCfgDOM.hasOwnProperty(CfgItem)){
            GenericCfgDOM[CfgItem].value(Cfg[CfgItem]);
          }
        }
      }

      function UpdateCellGeneralState(State){
        var GenericStateDOM = EIInfoDOM.CellInfo.GeneralState;

        if(State==null||State.length ===0){
          console.log("GeneralState does not exists");
          return;
        }
        for(var StateItem in State){
          if(State.hasOwnProperty(StateItem) && GenericStateDOM.hasOwnProperty(StateItem)){
            GenericStateDOM[StateItem].value(State[StateItem]);
          }
        }
      }

      function UpdateCellDetailStateUl(State){
        var DetailStateUl = EIInfoDOM.CellInfo.DetailState_Ul;

        if(State==null||State.length ===0){
          console.log("CellDetailStateUl does not exists");
          return;
        }
        for(var StateItem in State){
          if(State.hasOwnProperty(StateItem) && DetailStateUl.hasOwnProperty(StateItem)){
            DetailStateUl[StateItem].value(State[StateItem]);
          }
        }
      }

      function UpdateCellDetailStateDl(State){
        var DetailStateDl = EIInfoDOM.CellInfo.DetailState_Dl;

        if(State==null||State.length ===0){
          console.log("CellDetailStateDl does not exists");
          return;
        }
        for(var StateItem in State){
          if(State.hasOwnProperty(StateItem) && DetailStateDl.hasOwnProperty(StateItem)){
            DetailStateDl[StateItem].value(State[StateItem]);
          }
        }
      }

      function UpdateUeInfo(UeList){
        var UeItem = null,
            UeInfo = EIInfoDOM.UEInfo,
            UeListTable =$("#UEInfoTable"),
            rowItem = null,
            TableDataField = [];

        if(UeList==null||UeList.length ===0){
          console.log("UeList does not exists");
          return;
        }
        for(var item in UeList){
          if(UeList.hasOwnProperty(item)){
            UeItem = UeList[item];
            for(var Uepara in UeItem){
              if(UeItem.hasOwnProperty(Uepara) && UeInfo.hasOwnProperty(Uepara)){
                rowItem[UeInfo[Uepara]] = UeItem[Uepara];
              }
            }
            TableDataField.push(rowItem);
          }
        }
        UeListTable.bootstrapTable({data: TableDataField});

      }
    }

  });

  function ParseTestCaseGrpSection(ResList){
    var TestCaseGrp = null;
    var template = $(' <div class="form-group">\
      <div class="col-sm-1">\
      <input type="radio" name="TestCaseGrp">\
      </div>\
      <label></label>\
      </div>');
    var ResTypeStr = (ResType === "Sim") ? "simulation":"real";
    var TestCaseGrpList = [];

    for(var item in ResList){
      if(ResList.hasOwnProperty(item) ){
        if(ResList[item].Type !=="both" && ResList[item].Type !==ResTypeStr){
          continue;
        }
        TestCaseGrp = ResList[item];
        template.find("label").attr('for','TestCaseGrp_'+TestCaseGrp.ID).text(TestCaseGrp.Name);
        template.find("input").attr({
          'value':TestCaseGrp.ID,
          'ID':'TestCaseGrp_'+TestCaseGrp.ID
        });

        TestCaseGrpList.push(template[0].outerHTML);

      }
    }
    $('#TestCaseGrpSection_body').append(TestCaseGrpList.join(''));
  }

  function TestCaseGrpLoaded(Type,ResList){
    if(ResList ==null){
      console.log("ResList Error");
      return;
    }

    $(function(){
      ParseTestCaseGrpSection(ResList);
    });

  }

  function ParseTaskRunningSection(TaskId){

    var template = $(' <div class="panel panel-default" style="display: none">\
      <div class="panel-heading panel-default">\
        <h4 class="panel-title">\
          <a data-toggle="collapse" data-parent="#panel_TaskList"></a>\
          <span class="badge badge-inverse pull-right">Running</span>\
        </h4>\
      </div>\
      <div class="panel-collapse collapse">\
        <div class="panel-body">\
        实时显示当前原子操作--敬请期待\
        </div>\
      </div>\
      </div>'),
        SpanFlashTimerID = null,
        SpanInstCache = template.find(".panel-title span");


    template.attr("id",TaskId);
    template.find("a[data-toggle=collapse]").text(common.DateFormat(null)).attr("href","#panel_TaskItem"+"_"+TaskId);
    template.find(".panel-body").parent().attr("id","panel_TaskItem"+"_"+TaskId);

    SpanFlashTimerID = setInterval(function(){ SpanInstCache.fadeOut(500).fadeIn(500); },1000);
    $("#panel_TaskList").append(template);
    template.show(500);

    return SpanFlashTimerID;
  }

  function TaskEndHandle(TaskStatusRes){
    var TaskStatus = TaskStatusRes.task;
    $('#BeginTest').button('reset');
    if(TaskStatusRes.result === 0 && TaskStatusRes.message === 'success'){
      $('#TestCaseGrpSection').show(1000);
      $("#VerSelectSection").show(1000);
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
      $("#" + TaskStatus.id + " span.badge").text("失败");
      $("#" + TaskStatus.id).removeClass("panel-default").toggleClass("panel-danger",true);
      $("#" + TaskStatus.id + " span.badge").removeClass("badge-inverse").toggleClass("badge-important",true);
    }
    else if(TaskStatus.result === "success"){
      $("#" + TaskStatus.id + " span.badge").text("成功");
      $("#" + TaskStatus.id).removeClass("panel-default").toggleClass("panel-success",true);
      $("#" + TaskStatus.id + " span.badge").removeClass("badge-inverse").toggleClass("badge-success",true);
    }
    else{
      console.log('Unknown TaskStatus Result: '+ TaskStatus.result);
    }
  }

  function ParseTaskLogSection(TaskLog,Begin,End){
    var item = 0;
    var length = 0;

    if(Begin > End){
      End = TaskLog.length;
      item = Begin;
    }
    length = End - Begin;

    for(;item < length;item++){
      if(TaskLog.hasOwnProperty(item)){
        $('#Log_TaskStatusContent').append($("<p/>").text(TaskLog[item].content));
      }
    }

    if(item === length){
      return Begin+length;
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

    $('#TestCaseGrpSection').hide(1000);
    $("#VerSelectSection").hide(1000);
    $("#BeginTest").button('loading');
    TaskUITimer = ParseTaskRunningSection(CurTaskId);

    return function TaskLogHandler(TaskLog,Res){

      if(TaskLog.log.length !== 0){
        NextLogId = ParseTaskLogSection(TaskLog.log,NextLogId,TaskLog.current_log_id);
        $("#Log_TaskStatus").data("plugin_tinyscrollbar").update("relative");
      }

      if(TaskLog.status === "run"){
        if(CurTimerID ===null){
          CurTimerID = setInterval(function () {
            Res.QueryRunningLog(TaskLogHandler,CurTaskId,NextLogId);
          }, 3000);
        }
        else if(NextLogId >TaskLog.current_log_id){
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

  function ModifySubmitObject(ResType,IsURL){

    if(IsURL){
      return { url:null };
    }

    if(ResType === "Real"){
      return { bin:null  };

    }
    else if(ResType === "Sim"){
       return {
        lte_app:null,
        lte_db:null
      };

    }
  }



});