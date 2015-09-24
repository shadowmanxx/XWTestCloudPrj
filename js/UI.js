/**
 * Created by Administrator on 2015/9/15.
 */

function UI(ResId){
  //关联资源ID(设备ID/用例组ID/其它ID)
  this.ResId = ResId;
}

UI.prototype = {

  //TODO:重构
  GenerateAndParseResTemplate: function(InsertBlock,itemData,MajorId,MinorId) {

    var template = $('#Sim_reslist tr:hidden').clone();

    //检查状态更新tr class样式
    switch(itemData.status){
      case 'idle':
        template.attr('class','success');
        break;
      case 'run':
        template.attr('class','info');
        break;
    }
    template.attr('id','Sim_resitem' + this.ResId);
    //解析数据内容添加td标签
    var tdHtmlContent = '<td>'+this.ResId+'</td>';

    //先按表头结构写死顺序
    tdHtmlContent+='<td>'+itemData.name+'</td>';
    if(itemData.config == null)
    {
      tdHtmlContent+='<td>'+'1BBU+3RRU'+'</td>';
    }
    else
    {
      tdHtmlContent+='<td>'+itemData.config+'</td>';
    }
    tdHtmlContent+='<td>'+itemData.ip+'</td>';
    tdHtmlContent+='<td>'+itemData.status+'</td>';

    //根据Status添加按钮
    if(itemData.status === 'idle')
    {
      tdHtmlContent+='<td><a href="javascript:;">开始测试</a></td>';
    }
    else
    {
      tdHtmlContent+='<td> </td>'
    }

    //将组合的td内容更新到tr中
    this.SetDOMHtmlContent(template,tdHtmlContent);
    template.find('a').attr('href','TaskStart.html?ResId='+this.ResId+'&MajorId='+MajorId+'&MinorId='+MinorId);
    /*新页面跳转，可传递原始对象参数，上下文也指向该父页面
    ResId = this.ResId;
    template.find('a').bind('click',function(){
      var cWin = window.open('TaskStart.html?ResId='+ResId,'_blank');
      var UsrObj = GetShareCache();
      cWin.window.top['_CACHE'] = $.extend(true, {}, UsrObj);
    });*/
    //添加到资源列表中
    $(template).appendTo(InsertBlock);
    template.show(1000);

    return template;
  },

  GenerateAndParseTestCaseGrp:function(Location,itemData){
    var template = $('<tr></tr>');

    //解析数据内容添加td标签
    var tdHtmlContent = '<td>'+this.ResId+'</td>';

    //先按表头结构写死顺序
    tdHtmlContent+='<td>'+itemData.Name+'</td>';
    tdHtmlContent+='<td>'+itemData.Creator+'</td>';
    tdHtmlContent+='<td>'+itemData.Attr+'</td>';
    tdHtmlContent+='<td><a href="#">修改</a></td>';

    //将组合的td内容更新到tr中
    this.SetDOMHtmlContent(template,tdHtmlContent);
    template.find('a').attr('id','TestCaseGrp_' + this.ResId);

    //添加到资源列表中
    $(template).appendTo(Location);
    template.show(1000);
    return template;
  },

  GenerateAndParseTestCase:function(Location,itemData){
    var template = null;

    if(Location === '#drag-dropZone'){

      template = $('<p class="ui-draggable"><a class="btn btn-default center-block" href="#modal-container" \
                  data-toggle="modal" role="button" id="modal"><span>' + itemData.Name +
                  '<button type="button" class="btn btn-default btn-xs remove pull-right"><span class="glyphicon glyphicon-trash">\
                  </span></button></span></a></p>');

      $(Location).append(template);
      return template;
    }
    else{
      template = $('<p><a class="btn btn-default center-block" href="#" data-toggle="popover" role="button" data-container="body"\
                          data-placement="right" data-content=""><span></span></a></p>');
      template.find('a').attr('data-content',itemData.Descp);
      template.find('span').text(itemData.Name);
      $(Location).append(template);
    }
  },

  ClearDOMTextContent: function(session){
    $(session).text('');
  },

  SetDOMHtmlContent: function(session,htmlContent) {
    $(session).html(htmlContent);
  },

  InsetTaskToList: function(task_id){
    var template = $("#panel_module").clone();
    var CurTime = new Date();

    template.attr("id",task_id);
    template.find("a").attr("href","#panel_TaskItem"+"_"+task_id);
    template.find("a").text(CurTime.toLocaleString());
    template.find("div").find(".panel-body").text("正在执行用例xx");
    template.find("#panel_TaskItem_1").attr("id","panel_TaskItem"+"_"+task_id);
    template.show(500);
    this.SpanFlashTimerID = setInterval(function(){ $("#"+task_id+" span").fadeOut(500).fadeIn(500); },1000);
    $("#panel_TaskList").append(template);
  },

  PrintLogToLogSession:function(DataList,session){
    if(DataList == null || DataList.length ===0)
    {
      console.log('dataLen = 0');
      return;
    }

    for(var item in DataList)
    {
      $(session).append((DataList[item].content) + '\n');
    }

  },

  ChangeTaskStatus: function (task) {

    if(task.result === "fail")
    {
      $("#" + task.id + " span").text("失败");
      $("#" + task.id).attr("class","panel panel-danger");
      $("#" + task.id + " span").attr("class","badge badge-important pull-right");
    }
    else if(task.result === "success")
    {
      $("#" + task.id + " span").find('span').text("成功");
      $("#" + task.id).attr("class","panel panel-success");
      $("#" + task.id + " span").find('span').attr("class","badge badge-success pull-right");
    }
  },

  closeWindow: function () {
    window.open('','_self');
    window.close();
  }
};