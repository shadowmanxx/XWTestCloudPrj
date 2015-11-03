
define(function(require){
  var Usr = require("obj/UserObj"),
      CommonUI = require("ui/Common");
  require("bootstrap");

  $(function () {
    $("#ResTab").children().each(function(){
      var href = $(this).find("a[data-toggle=tab]").attr("href");
      var Type = "";

      switch (href){
        case "#Simres_list":
          Type = "Sim";
          break;
        case "#Realres_list":
          Type = "Real";
          break;
        default :
          break;
      }
      (function(href,Type,Context){
        var TimerID = null;
        $(Context).children("a[data-toggle=tab]").on('show.bs.tab', function (e) {
          if($.trim($(href +" tbody").html()) ===""){
            Usr.QueryResList(ResourceLoaded,Type);

            TimerID = setInterval(function(){

              RecordLastClick(href);
              Usr.RemoveAllRes(Type);
              CommonUI.SetHtmlContent((href +" tbody"),"");
              Usr.QueryResList(ResourceLoaded,Type);
            }, 10000)
          }
        });

        $(Context).children("a[data-toggle=tab]").on('hide.bs.tab', function (e) {
          RecordLastClick(href);
          CommonUI.SetHtmlContent((href +" tbody"),"");
          Usr.RemoveAllRes(Type);
          clearInterval(TimerID);
        });
      }(href,Type,this));

    });

    $("#ResTab > li:eq(0) > a").tab("show");

    function RecordLastClick(href){
      var SelectedItem = $(href+" tbody tr.warning");

      if(SelectedItem.length !==0){
        Usr.SetLastClickResID(SelectedItem.index());
      }
    }

    function ResourceLoaded(ResType){

      //判断模拟/真实激活状态，确定绘制哪个页面
      var ResList = null,
        ResItem = null,
        template = null,
        LastContextID = Usr.GetLastClickResID(),
        LastContext = null;

      if("Sim" === ResType) {
        ResList = Usr.GetSimResList();

        for (var item in ResList) {
          if(ResList.hasOwnProperty(item)){
            ResItem = ResList[item];
          }
          else{
            console.log("SimResList has no ownproperty:"+item);
            continue;
          }
          template = GenerateSimResHtmlEle(ResItem);
          $(template).appendTo('#Simres_list tbody');

          (function(ResItem){
            template.click(function (){
              if(LastContext !==null && LastContext !== this){
                $(LastContext).toggleClass("warning");
              }
              else if(LastContext === this){
                return;
              }
              LastContext = this;
              ResItem.QueryResHistory();
              $(this).toggleClass("warning");
            });
          }(ResItem));

          template.hide().show(1000);
        }
        if(LastContextID !==null){
          LastContext = $("#Simres_list tbody tr:eq("+LastContextID+")").toggleClass("warning",true);

        }
      }
      else if("Real" === ResType){
        ResList = Usr.GetRealResList();
      }
      else{
        console.log('Unknown Type of Resource');
      }
    }

    function GenerateSimResHtmlEle(itemData){

      var template = $('<tr/>');

      //检查状态更新tr class样式
      switch(itemData.Status){
        case 'idle':
          template.attr('class','');
          break;
        case 'busy':
          template.attr('class','info');
          break;
      }
      template.attr('id','Sim_resitem' + itemData.ID);
      //解析数据内容添加td标签
      var tdHtmlContent = '<td>'+itemData.ID+'</td>';

      //先按表头结构写死顺序
      tdHtmlContent+='<td>'+itemData.Name+'</td>';
      if(itemData.Config == null){

        tdHtmlContent+='<td>'+'1BBU+3RRU'+'</td>';
      }
      else{

        tdHtmlContent+='<td>'+itemData.Config+'</td>';
      }

      tdHtmlContent+='<td>'+itemData.Ip+'</td>';
      tdHtmlContent+='<td>'+itemData.Status+'</td>';

      //根据Status添加按钮
      if(itemData.Status === 'idle'){

        tdHtmlContent+='<td><a>开始测试</a></td>';
      }
      else{

        tdHtmlContent+='<td> </td>'
      }

      //将组合的td内容更新到tr中
      template.html(tdHtmlContent);
      template.find('a').attr('href','TaskStart.html?ResId='+itemData.ID+'&MajorId='+itemData.Majorid+'&MinorId='+itemData.Minorid);

      return template;
    }

    function GenerateRealResHtmlEle(){

    }
  });


});
