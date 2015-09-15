/**
 * Created by Administrator on 2015/9/15.
 */

function UI(ResId)
{
  //关联资源ID(设备ID/用例组ID/其它ID)
  this.ResId = ResId;
}

UI.prototype = {

  GenerateAndParseResTemplate: function(InsertBlock,itemData,IdIndex) {

    var template = $('#Sim_reslist tr:hidden').clone();

    //检查状态更新tr class样式
    switch(itemData.status)
    {
      case 'idle':
        template.attr('class','success');
        break;
      case 'running':
        template.attr('class','success');
        break;
    }
    //解析数据内容添加td标签
    var tdHtmlContent = '<td>'+IdIndex+'</td>';

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
      tdHtmlContent+='<td><a href="BeginTest.html">开始测试</a></td>';
    }
    else
    {
      tdHtmlContent+='<td> </td>'
    }

    //将组合的td内容更新到tr中
    this.SetDOMHtmlContent(template,tdHtmlContent);
    //添加到资源列表中
    $(template).appendTo(InsertBlock);
    template.show(1000);

    return template;
  },

  AddHandlerToEvent: function (Ele,Event,Handler) {
    $(Ele).bind(Event,Handler);
  },

  ClearDOMTextContent: function(session){
    session.text('');
  },

  SetDOMHtmlContent: function(session,htmlContent) {
    session.html(htmlContent);
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
};