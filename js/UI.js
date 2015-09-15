/**
 * Created by Administrator on 2015/9/15.
 */

function UI(ResId)
{
  //������ԴID(�豸ID/������ID/����ID)
  this.ResId = ResId;
}

UI.prototype = {

  GenerateAndParseResTemplate: function(InsertBlock,itemData,IdIndex) {

    var template = $('#Sim_reslist tr:hidden').clone();

    //���״̬����tr class��ʽ
    switch(itemData.status)
    {
      case 'idle':
        template.attr('class','success');
        break;
      case 'running':
        template.attr('class','success');
        break;
    }
    //���������������td��ǩ
    var tdHtmlContent = '<td>'+IdIndex+'</td>';

    //�Ȱ���ͷ�ṹд��˳��
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

    //����Status��Ӱ�ť
    if(itemData.status === 'idle')
    {
      tdHtmlContent+='<td><a href="BeginTest.html">��ʼ����</a></td>';
    }
    else
    {
      tdHtmlContent+='<td> </td>'
    }

    //����ϵ�td���ݸ��µ�tr��
    this.SetDOMHtmlContent(template,tdHtmlContent);
    //��ӵ���Դ�б���
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
    template.find("div").find(".panel-body").text("����ִ������xx");
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
      $("#" + task.id + " span").text("ʧ��");
      $("#" + task.id).attr("class","panel panel-danger");
      $("#" + task.id + " span").attr("class","badge badge-important pull-right");
    }
    else if(task.result === "success")
    {
      $("#" + task.id + " span").find('span').text("�ɹ�");
      $("#" + task.id).attr("class","panel panel-success");
      $("#" + task.id + " span").find('span').attr("class","badge badge-success pull-right");
    }
  },
};