/**
 * Created by Administrator on 2015/9/17.
 */

//测试用例类
function TestCase(ID,Name,Description){

  this.ID = ID;
  this.Name = Name;
  this.Descp = Description;
  this.CfgPara = [];
}

TestCase.prototype = {

  GetID: function() {
    return this.ID;
  },

  GetDescription: function () {
    return this.Descp;
  },

  AddPara: function(Name,Property) {

    //防止重复添加属性
    this.RemovePara(Name);
    this.CfgPara.push({
      'Name':Name,
      'Property':Property
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
function TestCaseGrp(ID,Rule){

  this.ID = ID;
  this.TestCaseList = [];
  this.VerifyRule = Rule;
}

TestCaseGrp.prototype = {

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