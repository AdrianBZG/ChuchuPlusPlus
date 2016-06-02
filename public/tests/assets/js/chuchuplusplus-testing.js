var chaiExpect = chai.expect;

describe("Chuchu++ Tests", function(){
   var sandbox; // Using Sinon
   
   beforeEach(function() {
      // Using Sinon
      sandbox = sinon.sandbox.create();
      sandbox.stub(window.console, "log");
      sandbox.stub(window.console, "error");
   });
  
   afterEach(function() {
      // Using Sinon
      sandbox.restore();
   });
   
   describe("Testing Toto and Titi", function(){
      it("Toto", function(){
         var r = 1;
         chaiExpect(r).to.equal(1);
      });
      
      it("Titi", function(){
         var r = 2;
         chaiExpect(r).to.equal(2);
      });
   });
});
