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

    $.ajax({
      type:"GET",
      url:"/front/subresource?all=1&type=bbu",
      cache:false,
      dataType:'json',
      contentType:"application/json;charset=UTF-8",
      context:this,
      success:function(eNBInfo) {
        if(eNBInfo.result !==0){
          alert(eNBInfo.message);
          return;
        }
        GenerateEnbList($EnbInfoList,eNBInfo.enblist);
      },
      error: function() {
        $EnbInfoList.html("<h1>Query EnbList Error</h1>");
        console.log("QueryEnbListError");
        return;
      }
    });

  });

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

      for(var IMSIIndex=0;IMSIIndex < CellInfo.uelist.length;++IMSIIndex){
        $("<a/>").attr("href", "UERealTimeInfo.html?IMSI="+CellInfo.uelist[IMSIIndex].imsi)
          .text("*"+(CellInfo.uelist[IMSIIndex].imsi%10000))
          .appendTo($IMSIListRow);

        if((IMSIIndex+1) % 8 ===0 || IMSIIndex === CellInfo.uelist.length-1){
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
      StatusSpan.text("lost").toggleClass("badge-important",true);
    }
    else if(Res.status === "idle"){
      StatusSpan.text("idle").toggleClass("badge-success",true);
    }
    else if(Res.status === "busy"){
      StatusSpan.text("busy").toggleClass("badge-warning",true);
    }
    else{
      StatusSpan.text("abnormal").toggleClass("badge-inverse",true);
    }

    ParaListSpan.push('<span class="badge">'+"EpcIP:"+Res.enbIP+'</span>');

    CurModule.find("a[data-toggle=collapse]").text(ResId).attr("href","#"+ResId);
    panelBody.parent().attr("id",ResId).on('show.bs.collapse', function (e) {

      $.ajax({
        type:"GET",
        url:"/front/subresource?type=bbu&id="+Res.enbid,
        cache:false,
        dataType:'json',
        contentType:"application/json;charset=UTF-8",
        context:this,
        success:function(eNBInfo) {
          if(eNBInfo.result !==0){
            alert(eNBInfo.message);
            return;
          }
          GenerateCellInfoSection(panelBody,eNBInfo);
        },
        error: function() {
          console.log("QueryUEInfoError");
        }
      });


    });
    //将设备主要参数写入title中

    StatusSpan.before(ParaListSpan.join(''));
  }


});

