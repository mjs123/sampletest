var sample = require('../src/sample');
var sinon = require('sinon');
var chai = require('chai');
chai.should();

describe("Validate SampleAPI",function(){
    var service;
    before(function(){
        service = {
            SecondAPI:function(){},
            FirstAPI:function(){}
        }
    })
    this.afterEach(function(){
        sinon.restore();
    })

    it("invalid request",async function(){
        sinon.stub(service,'FirstAPI').resolves({error:"simulated error",response:{statusCode:500}});
        let out = await sample(service,[],"","")
        out.error.should.equal("request not proper")
        out.response.statusCode.should.equal(400)
        //sinon.assert.calledOnce(service.FirstAPI);
    })

    it("Create failed",async function(){
        sinon.stub(service,'FirstAPI').resolves({error:"simulated error",response:{statusCode:500}});
        let out = await sample(service,[1,2,3,4,5,6],"","")
        out.error.should.equal("simulated error")
        out.response.statusCode.should.equal(500)
        sinon.assert.calledOnce(service.FirstAPI);
    })

    it("Exception in create",async function(){
        sinon.stub(service,'FirstAPI').throws("thrown error")
        let out = await sample(service,[1,2,3,4,5,6],"","")
        out.error.name.should.equal("thrown error")
        out.response.body.should.equal("internal error")
        sinon.assert.calledOnce(service.FirstAPI);
    })


    it("Create success,but associate failed",async function(){
        sinon.stub(service,'FirstAPI').resolves({error:null,response:{statusCode:200,body:{Id:'id123456'}}});
        sinon.stub(service,'SecondAPI').resolves({error:"associated error",response:{statusCode:504}});
        let out = await sample(service,[1,2,3,4,5,6],"","")
        out.error.should.equal("associated error")
        out.response.statusCode.should.equal(504)
        out.response.body.Id.should.equal('id123456')
        sinon.assert.calledOnce(service.FirstAPI);
        sinon.assert.calledOnce(service.SecondAPI);
    })

    it("Exception in associate",async function(){
        sinon.stub(service,'FirstAPI').resolves({error:null,response:{statusCode:200,body:{Id:'id123456'}}});
        sinon.stub(service,'SecondAPI').throws("thrown error for associate");
        let out = await sample(service,[1,2,3,4,5,6],"","")
        out.error.name.should.equal("thrown error for associate")
        out.response.body.should.equal("internal error")
        //out.response.body.Id.should.equal('id123456')
        sinon.assert.calledOnce(service.FirstAPI);
        sinon.assert.calledOnce(service.SecondAPI);
    })

    it("Create success,first associate pass,second associate failed",async function(){
        sinon.stub(service,'FirstAPI').resolves({error:null,response:{statusCode:200,body:{Id:'id123456'}}});
        var callback = sinon.stub(service,'SecondAPI')
        callback.onCall(0).resolves({error:null,response:{statusCode:204}});
        callback.onCall(1).resolves({error:'second iteration error',response:{statusCode:506}});
        let out = await sample(service,[1,2,3,4,5,6],"","")
        out.error.should.equal("second iteration error")
        out.response.statusCode.should.equal(506)
        out.response.body.Id.should.equal('id123456')
        sinon.assert.calledOnce(service.FirstAPI);
        sinon.assert.callCount(service.SecondAPI, 2)
    })

    it("Only associate",async function(){
        sinon.spy(service,'FirstAPI')
        var callback = sinon.stub(service,'SecondAPI')
        callback.onCall(0).resolves({error:null,response:{statusCode:204}});
        callback.onCall(1).resolves({error:null,response:{statusCode:204}});
        callback.onCall(2).resolves({error:null,response:{statusCode:204}});
        callback.onCall(3).resolves({error:null,response:{statusCode:204}});
        callback.onCall(4).resolves({error:null,response:{statusCode:204}});
        callback.onCall(5).resolves({error:null,response:{statusCode:204}});
        let out = await sample(service,[1,2,3,4,5,6],"","id123456")
        out.response.statusCode.should.equal(200)
        out.response.body.Id.should.equal('id123456')
        sinon.assert.callCount(service.FirstAPI,0);
        sinon.assert.callCount(service.SecondAPI, 6)
    })

    it("Only associate,fourth fails",async function(){
        sinon.spy(service,'FirstAPI')
        var callback = sinon.stub(service,'SecondAPI')
        callback.onCall(0).resolves({error:null,response:{statusCode:204}});
        callback.onCall(1).resolves({error:null,response:{statusCode:204}});
        callback.onCall(2).resolves({error:null,response:{statusCode:204}});
        callback.onCall(3).resolves({error:"error step",response:{statusCode:504}});
        callback.onCall(4).resolves({error:null,response:{statusCode:204}});
        callback.onCall(5).resolves({error:null,response:{statusCode:204}});
        let out = await sample(service,[1,2,3,4,5,6],"","id123456")
        out.response.statusCode.should.equal(504)
        out.response.body.Id.should.equal('id123456')
        out.error.should.equal("error step")
        sinon.assert.callCount(service.FirstAPI,0);
        sinon.assert.callCount(service.SecondAPI, 4)
    })

    it("Create success,fifth associate failed",async function(){
        sinon.stub(service,'FirstAPI').resolves({error:null,response:{statusCode:200,body:{Id:'id123456'}}});
        var callback = sinon.stub(service,'SecondAPI')
        callback.onCall(0).resolves({error:null,response:{statusCode:204}});
        callback.onCall(1).resolves({error:null,response:{statusCode:204}});
        callback.onCall(2).resolves({error:null,response:{statusCode:204}});
        callback.onCall(3).resolves({error:'fifth iteration error',response:{statusCode:506}});
        let out = await sample(service,[1,2,3,4,5,6],"","")
        out.error.should.equal("fifth iteration error")
        out.response.statusCode.should.equal(506)
        out.response.body.Id.should.equal('id123456')
        sinon.assert.calledOnce(service.FirstAPI);
        sinon.assert.callCount(service.SecondAPI, 4)
    })

    it("Create success,last associate failed",async function(){
        sinon.stub(service,'FirstAPI').resolves({error:null,response:{statusCode:200,body:{Id:'id12345'}}});
        var callback = sinon.stub(service,'SecondAPI')
        callback.onCall(0).resolves({error:null,response:{statusCode:204}});
        callback.onCall(1).resolves({error:null,response:{statusCode:204}});
        callback.onCall(2).resolves({error:null,response:{statusCode:204}});
        callback.onCall(3).resolves({error:'fifth iteration error',response:{statusCode:506}});
        let out = await sample(service,[1,2,3,4,5],"","")
        out.error.should.equal("fifth iteration error")
        out.response.statusCode.should.equal(506)
        out.response.body.Id.should.equal('id12345')
        sinon.assert.calledOnce(service.FirstAPI);
        sinon.assert.callCount(service.SecondAPI, 4)
    })


    it("Create success,all associates success",async function(){
        sinon.stub(service,'FirstAPI').resolves({error:null,response:{statusCode:200,body:{Id:'id123456'}}});
        var callback = sinon.stub(service,'SecondAPI')
        callback.onCall(0).resolves({error:null,response:{statusCode:204}});
        callback.onCall(1).resolves({error:null,response:{statusCode:204}});
        callback.onCall(2).resolves({error:null,response:{statusCode:204}});
        callback.onCall(3).resolves({error:null,response:{statusCode:204}});
        callback.onCall(4).resolves({error:null,response:{statusCode:204}});
        let out = await sample(service,[1,2,3,4,5,6],"","")
        out.response.statusCode.should.equal(200)
        out.response.body.Id.should.equal('id123456')
        sinon.assert.calledOnce(service.FirstAPI);
        sinon.assert.callCount(service.SecondAPI, 5)
    })

    it("Communityid undefined,Create success,all associates success",async function(){
        sinon.stub(service,'FirstAPI').resolves({error:null,response:{statusCode:200,body:{Id:'id123456'}}});
        var callback = sinon.stub(service,'SecondAPI')
        callback.onCall(0).resolves({error:null,response:{statusCode:204}});
        callback.onCall(1).resolves({error:null,response:{statusCode:204}});
        callback.onCall(2).resolves({error:null,response:{statusCode:204}});
        callback.onCall(3).resolves({error:null,response:{statusCode:204}});
        callback.onCall(4).resolves({error:null,response:{statusCode:204}});
        let out = await sample(service,[1,2,3,4,5,6])
        out.response.statusCode.should.equal(200)
        out.response.body.Id.should.equal('id123456')
        sinon.assert.calledOnce(service.FirstAPI);
        sinon.assert.callCount(service.SecondAPI, 5)
    })

    it("Communityid undefined,Create success,fifth associate failed",async function(){
        sinon.stub(service,'FirstAPI').resolves({error:null,response:{statusCode:200,body:{Id:'id123456'}}});
        var callback = sinon.stub(service,'SecondAPI')
        callback.onCall(0).resolves({error:null,response:{statusCode:204}});
        callback.onCall(1).resolves({error:null,response:{statusCode:204}});
        callback.onCall(2).resolves({error:null,response:{statusCode:204}});
        callback.onCall(3).resolves({error:'fifth iteration error',response:{statusCode:506}});
        let out = await sample(service,[1,2,3,4,5,6])
        out.error.should.equal("fifth iteration error")
        out.response.statusCode.should.equal(506)
        out.response.body.Id.should.equal('id123456')
        sinon.assert.calledOnce(service.FirstAPI);
        sinon.assert.callCount(service.SecondAPI, 4)
    })

})