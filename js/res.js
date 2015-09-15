/**
 * Created by xiaoxu on 2015/9/8.
 */
$(document).ready(function() {

  var IdIndex = 1;
  QueryResList();

  //请求资源列表
  function QueryResList(){

    var ReqContent = {
      "":""
    };
    var contentTypeStr = 'application/json;charset=UTF-8';
    var urlpara = '/front/resource?all=1';

    $.ajax({
      type:"GET",
      url:urlpara,
      cache:false,
      dataType:'json',
      contentType:contentTypeStr,
      data:JSON.stringify(ReqContent),

      success:ProcessQueryResList,
      error: function() {
        alert("ResList Fetch Error!");
      }
    });
  }

  function ProcessQueryResList(ResListArray) {
    var item = null;
    var InsertBlock = '';

    //遍历主设备资源列表
    for(var resIndx in ResListArray)
    {
      item = ResListArray[resIndx].sub_resource;

      if(ResListArray[resIndx].type === 'simulation')
      {
        InsertBlock = '#Sim_reslist tbody';
        //遍历从设备资源列表
        for(var index in item)
        {
          //TODO:记录到对应实例中
          item[index].ip = ResListArray[resIndx].ip;
          AddResItemToList(InsertBlock,item[index]);
        }
      }
      else if(ResListArray[resIndx].type === 'real')
      {
        InsertBlock = '#Realres_list tbody';
        //TODO:添加真实环境处理
      }

    }
  }

  function QueryDeviceHistory(IdIndex){
    //请求历史操作Log
    var ReqContent = {
      "":""
    };
    var contentTypeStr = 'application/json;charset=UTF-8';
    var urlpara = '/front/task/list?major_id=1&minor_id='+IdIndex;

    $.ajax({
      type:"GET",
      url:urlpara,
      cache:false,
      dataType:'json',
      contentType:contentTypeStr,
      data:JSON.stringify(ReqContent),

      success:ProcessDeviceHistoryQuery,
      error: function() {
        alert("QueryHistoryLog Error!");
      }
    });

  }

  function ProcessDeviceHistoryQuery(data){
    var HistoryContent = '';
    var TaskList = data.task;
    var CurTime = null;
    //清空历史域
    $('#history_Log').html('');

    for(var TaskItem in TaskList)
    {
      CurTime = new Date(TaskList[TaskItem].date);
      HistoryContent += '<h5 style="white-space:pre">'+ CurTime.toLocaleString() + '     '+ TaskList[TaskItem].user +
                        '   ExecTaskid：'+TaskList[TaskItem].id + '   Status：'+TaskList[TaskItem].status +
                        '   Result：'+TaskList[TaskItem].result+'</h5>';
    }
    $('#history_Log').html(HistoryContent);

  }

  function AddResItemToList(InsertBlock,itemData) {

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
      tdHtmlContent+='<td>'+item.config+'</td>';
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
    //添加tr click请求历史操作
    template.click({"IdIndex":IdIndex},
      function(event) {
        QueryDeviceHistory(event.data.IdIndex);

      }
    );
    //将组合的td内容更新到tr中
    template.html(tdHtmlContent);
    ++IdIndex;
    //添加到资源列表中
    $(template).appendTo(InsertBlock);
    template.show(1000);

  }

  var jsontmp = {

    "res_list":[
      {"name":"Docker0","type":"sim","config":"1bbu","status":"running"},
      {"name":"Docker1","type":"sim","config":"1bbu","status":"idle"},
      {"name":"Docker2","type":"sim","config":"1bbu","status":"exiting"},

    ]
  };
  $('#test').click(function(){AddResItemToList('#Sim_reslist tbody',jsontmp.res_list[IdIndex-1]);});
})
