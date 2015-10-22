
function GenerateSimResHtmlEle(itemData){

  var template = $('<tr/>');

  //检查状态更新tr class样式
  switch(itemData.Status){
    case 'idle':
      template.attr('class','');
      break;
    case 'busy':
      template.attr('class','warning');
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

function ParseElement(Location,item){

}

//特定页面资源加载成功后操作
function ResourceLoaded(e,UsrObj){

  //判断模拟/真实激活状态，确定绘制哪个页面
  var Location = $('#ResTab').children('li.active').children('a').attr('href');
  var ResList = null;
  var template = null;

  if('#Simres_list' === Location) {

    ResList = UsrObj.SimResArray;
    var LastContext = null;
    for (var item in ResList) {
      template = GenerateSimResHtmlEle(ResList[item]);
      $(template).appendTo('#Simres_list tbody');

      (function(item){
        template.click(function (){
          if(LastContext !==null && LastContext !== this){
            $(LastContext).toggleClass("info");
          }
          else if(LastContext === this){
            return;
          }
          LastContext = this;
          ResList[item].QueryResHistory();
          $(this).toggleClass("info");
      });
      }(item));

      template.hide().show(1000);
    }
  }
  else if('#Realres_list' === Location){
    ResList = UsrObj.RealResArray;
  }
  else{
    console.log('Unknown Location To Insert');
  }
}

function PageInit(){

  //全局唯一实例，TODO:改成单例模式

  var Usr = new UsrObj($.cookie('username'),$.cookie('xwsessionid'));
  Usr.QueryResList();

  setInterval(function(){
    Usr.RemoveAllRes();
    Usr.QueryResList();
  }, 10000)

}


$(document).on('DocReady',PageInit);
$(document).on('ResourceLoaded',ResourceLoaded);


