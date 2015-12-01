/**
 * Created by Administrator on 2015/9/14.
 */

define(function(require){
  var $ = require('jquery'),
      Usr = require("obj/UserObj"),
      $EnbInfoList = $("#EnbInfoList");
  require("bootstrap");
  require("jquery_ui");
  require("bootstrap-table");

  $(function(){

    RealResLoadHandler();

  });

  function RealResLoadHandler(){
    var eNBInfoList = [
      {enbID:4005,enbName:"xwcloudtest1",status:"lost"},
      {enbID:4006,enbName:"xwcloudtest2",status:"normal"},
      {enbID:4007,enbName:"xwcloudtest3",status:"lost"}
    ];

    GenerateEnbList($EnbInfoList,eNBInfoList);
  }

  function GenerateEnbList($el,eNBInfoList) {
    var EnbInfoItem = null,
        EnbInfoItemID = null,
        columnItem = null,
        CurModule = null,
        EnbInfoHtmlList = [],
        template = $(' <div class="panel panel-default">\
                        <div class="panel-heading">\
                          <h4 class="panel-title">\
                            <a data-toggle="collapse"></a>\
                            <span class="badge pull-right"></span>\
                          </h4>\
                        </div>\
                        <div class="panel-collapse collapse">\
                          <div class="panel-body">\
                          </div>\
                        </div>\
                        </div>');


    for(EnbInfoItemID=0;EnbInfoItemID < eNBInfoList.length;++EnbInfoItemID){

      EnbInfoItem = eNBInfoList[EnbInfoItemID];
      CurModule = template.clone();
      GenerateDevTitleInfo(CurModule,EnbInfoItem,(EnbInfoItemID+1));

      $el.append(CurModule);
    }


  }

  function GenerateCellInfoSection($el,eNBInfo){
    var CellHtmlList = [],
        CellInfo = null,
        $IMSIDiv = null,
        $CellInfoRow = null,
        $IMSIListRow = null,
        $CellInfoList = $('<div class="col-md-8">\
                        <ul class="list-group" id="CellInfo">\
                        </ul>\
                      </div>'),
        $InsetSection = $CellInfoList.find("ul");

    $InsetSection.append($('<li class="list-group-item active"></li>').text("EnbID: "+eNBInfo.enbid));

    for(var rowItemId =0;rowItemId < eNBInfo.cellinfolist.length;++rowItemId){
      CellInfo = eNBInfo.cellinfolist[rowItemId];
      $IMSIDiv = $("<div class='col-md-9'></div>");

      $IMSIListRow = $("<div class='row'></div>");

      for(var IMSIIndex=0;IMSIIndex < CellInfo.ueinfolist.length;++IMSIIndex){
        $("<a/>").attr("href", "#")
          .text("*"+(CellInfo.ueinfolist[IMSIIndex].imsi%10000))
          .appendTo($IMSIListRow);

        if((IMSIIndex+1) % 8 ===0 || IMSIIndex === CellInfo.ueinfolist.length-1){
          $IMSIDiv.append($IMSIListRow);
          $IMSIListRow = $("<div class='row'></div>");
        }
      }

      $CellInfoRow = $('<div class="row"></div>');
      $CellInfoRow.append($('<h4 class="col-md-3"></h4>').text("Cell"+(rowItemId+1))
                  .append($("<small/>").text(CellInfo.cellid)))
          .append($IMSIDiv);


      $('<li class="list-group-item"></li>').append($CellInfoRow).appendTo($InsetSection);
    }

    $el.html($CellInfoList);



  }


  function GenerateDevTitleInfo(CurModule,Res,ResIndex){
    var ResId = "Enb"+ResIndex,
      StatusSpan = CurModule.find(".panel-title span"),
      ParaListSpan = [],
      panelBody = CurModule.find(".panel-body");

    if(Res.status === "lost"){
      StatusSpan.text("离线").toggleClass("badge-important",true);
    }
    else if(Res.status === "idle"){
      StatusSpan.text("空闲").toggleClass("badge-success",true);
    }
    else if(Res.status === "busy"){
      StatusSpan.text("忙碌").toggleClass("badge-warning",true);
    }
    else{
      StatusSpan.text("异常").toggleClass("badge-inverse",true);
    }

    ParaListSpan.push('<span class="badge">'+"EpcIP:"+Res.ip+'</span>');

    CurModule.find("a[data-toggle=collapse]").text(ResId).attr("href","#"+ResId);
    panelBody.parent().attr("id",ResId).on('show.bs.collapse', function (e) {
      var eNBInfo = {
        enbid:1259,
        cellinfolist:[
          {cellid:252,ueinfolist:[{imsi:460000851236},{imsi:460000851237},{imsi:460000851256},{imsi:460000908999},{imsi:460000851237},{imsi:460000851237},{imsi:460000851256},{imsi:460000908999},{imsi:460000851256},{imsi:460000908999},{imsi:460000851256},{imsi:460000908999},{imsi:460000908999},{imsi:460000851256},{imsi:460000908999},{imsi:460000908999},{imsi:460000851256},{imsi:460000908999},{imsi:460000908999},{imsi:460000851256},{imsi:460000908999},{imsi:460000908999},{imsi:460000851256},{imsi:460000908999},{imsi:460000908999},{imsi:460000851256},{imsi:460000908999},{imsi:460000908999},{imsi:460000851256},{imsi:460000908999}]},
          {cellid:253,ueinfolist:[{imsi:460000851236},{imsi:460000851237},{imsi:460000851237},{imsi:460000851237}]},
          {cellid:254,ueinfolist:[{imsi:460000851236}]}
        ]
      };
      GenerateCellInfoSection(panelBody,eNBInfo);
    });
    //将设备主要参数写入title中

    StatusSpan.before(ParaListSpan.join(''));
  }


});

