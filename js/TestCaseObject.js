/**
 * Created by Administrator on 2015/9/17.
 */

//测试用例类
function TestCaseObj(ID,Name,Creator,Description,SeverId){

  this.ID = ID;
  this.Name = Name;
  this.Creator = Creator;
  this.Descp = Description;
  this.SeverId = SeverId;
  this.CfgPara = [];
  this.Location = '#drag-items';
  this.UI = new UI(ID);

}

TestCaseObj.prototype = {

  GetID: function() {
    return this.ID;
  },

  GetDescription: function () {
    return this.Descp;
  },

  AddPara: function(Name,Property,Comment) {

    //防止重复添加属性
    this.RemovePara(Name);
    this.CfgPara.push({
      'Name':Name,
      'Property':Property,
      'Comment':Comment
    });
  },

  RemovePara:function(Name){

    if(this.CfgPara.length === 0)
    {
      console.log('CfgPara Empty Can\'t Delete');
      return;
    }

    for(var Index in this.CfgPara){
      if(this.CfgPara.hasOwnProperty(Index) && this.CfgPara[Index].Name === Name) {
        break;
      }
    }

    if(Index === this.CfgPara.length - 1){
      console.log('No Such TestCaseName='+Name);
      return -1;
    }

    this.CfgPara.splice(Index,1);
  }
};


//测试用例组类
function TestCaseGrpObj(ID,Name,Creator,Attr,Desc,ServerId){

  this.ID = ID;
  this.Name = Name;
  this.TestCaseList = [];
  this.Creator = Creator;
  this.Attr = Attr;
  this.Desc = Desc;
  this.ServerId = ServerId;
  this.UI = new UI(ID);
  this.Location = '#TestCaseGrpTable';
}

TestCaseGrpObj.prototype = {

  GetID: function() {
    return this.ID;
  },

  GetTestCaseList:function(){
    return this.CfgPara;
  },

  AddTestCase: function (TestCase){

    this.RemoveTestCase(TestCase.Name);
    this.TestCaseList.push(TestCase);
  },

  RemoveTestCase:function(Name){

    if(this.TestCaseList.length ===0){
      console.log('TestCaseGrpList Empty');
      return;
    }

    for(var Index in this.TestCaseList){

      if(this.TestCaseList.hasOwnProperty(Index) && this.TestCaseList[Index].Name === Name){
        break;
      }
    }

    if(Index === this.TestCaseList.length - 1){
      console.log('No such TestCase Name='+Name);
      return -1;
    }

    this.TestCaseList.splice(Index,1);
  }
};