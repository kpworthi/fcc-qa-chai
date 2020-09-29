var chai = require('chai');
var assert = chai.assert;

var server = require('../server');    /** import the Express app **/

var chaiHttp = require('chai-http');  /** require the chai-http plugin **/
chai.use(chaiHttp);                   /** use the chai-http plugin **/


suite('Functional Tests', function() {

  // Mocha allows testing asyncronous operations.
  // There is a small (BIG) difference. Can you spot it ?
  
  // ### EXAMPLE ### 
  test('Asynchronous test #example', function(done){ /** <= Pass a callback to the test function **/
    setTimeout(function(){
      assert.isOk('Async test !!');
      done(); /** Call 'done()' when the async operation is completed**/
    }, 500);   // the function will be executed after 500ms
  });
  
  // NOTE: The tests having #example in their description string,
  // are instructional examples and are not parsed by our test analyser
  
  suite('Integration tests with chai-http', function() {
    // We can test our API endpoints using a plugin, called chai-http.
    // Let's see how it works. And remember, API calls are asynchronous...
    
    // ### EXAMPLE ### 
    suite('GET /hello?name=[name] => "hello [name]"', function(){
      // We send a name string in the url query string.
      test('#example - ?name=John',  function(done){   // Don't forget the callback...
         chai.request(server)             // 'server' is the Express App
          .get('/hello?name=John')        // http_method(url)
          .end(function(err, res){        // Send the request. Pass a callback in
                                          // node style. `res` is the response object
            // res.status contains the status code
            assert.equal(res.status, 200, 'response status should be 200');
            // res.text contains the response as a string
            assert.equal(res.text, 'hello John', 'response should be "hello John"');
            done();
          });
      });
      
      /** Ready to have a try ?
       * Replace assert.fail(). Make the test pass. **/
       
      // If no name is passed, the endpoint responds with 'hello Guest'.
      test('Test GET /hello with no name',  function(done){ // Don't forget the callback...
         chai.request(server)             // 'server' is the Express App
          .get('/hello')                  // http_method(url). NO NAME in the query !
          .end(function(err, res){        // res is the response object
          
            // Test the status and the text response (see the example above). 
            // Please follow the order -status, -text. We rely on that in our tests.
            // It should respond 'Hello Guest'
            assert.equal(res.status, 200);
            assert.equal(res.text, 'hello Guest');
            done();   // Always call the 'done()' callback when finished.
          });
      });

      /**  Another one... **/
      test('Test GET /hello with your name',  function(done){ // Don't forget the callback...
         chai.request(server)             // 'server' is the Express App
          .get('/hello?name=name') /** <=== Put your name in the query **/ 
          .end(function(err, res){        // res is the response object
          
            // Your tests here.
            // Replace assert.fail(). Make the test pass.
            // Test the status and the text response. Follow the test order like above.
            assert.equal(res.status, 200);
            assert.equal(res.text, 'hello name'/** <==  Put your name here **/);
            done();   // Always call the 'done()' callback when finished.
          });
      });

    });

    // In the next example we'll see how to send data in a request payload (body).
    
    // ### EXAMPLE ### 
    suite('PUT /travellers', function(){
      test('#example - responds with appropriate JSON data when sending {surname: "Polo"}',  function(done){
         chai.request(server)
          .put('/travellers')         // note the PUT method
          .send({surname: 'Polo'})    // attach the payload, encoded as JSON
          .end(function(err, res){    // Send the request. Pass a Node callback

            assert.equal(res.status, 200, 'response status should be 200');
            assert.equal(res.type, 'application/json', "Response should be json");
            
            // res.body contains the response parsed as a JS object, when appropriate
            // (i.e the response type is JSON)
            assert.equal(res.body.name, 'Marco', 'res.body.name should be "Marco"');
            assert.equal(res.body.surname, 'Polo', 'res.body.surname should be "Polo"' );
            
            done();
          });
      });

      // We expect the response to be
      // {name: 'Cristoforo', surname: 'Colombo', dates: '1451 - 1506'}
      // check the status, the type, name and surname.
      
      test('send {surname: "Colombo"}',  function(done){

       chai.request(server)
        .put('/travellers')
        .send({surname: 'Colombo'})
        .end(function(err, res){
          
          assert.equal(res.status, 200, 'Server status code should be 200');
          assert.equal(res.type, 'application/json', 'Response should be JSON');
          assert.equal(res.body.name, 'Cristoforo', 'First name should match Cristoforo');
          assert.equal(res.body.surname, 'Colombo', 'Last name should match Colombo');
          
          done();
        });
      });

      test('send {surname: "da Verrazzano"}', function(done) {
        chai.request(server)
            .put('/travellers')
            .send({surname: 'da Verrazzano'})
            .end(function(err, res){
              
              assert.equal(res.status, 200, 'Status to be 200');
              assert.equal(res.type, 'application/json', 'Res to be json');

              assert.equal(res.body.name, 'Giovanni');
              assert.equal(res.body.surname, 'da Verrazzano');

              done();
            })

      });
    });

  });

  // In the next challenges we are going to simulate the human interaction with
  // a page using a device called 'Headless Browser'. A headless browser is a web
  // browser without a graphical user interface. These kind of tools are
  // particularly useful for testing web pages as they are able to render
  // and understand HTML, CSS, and JavaScript the same way a browser would.

  var Browser = require('zombie');

  /** ### Copy your project's url here  ### **/
  Browser.site = 'https://fcc-qa-chai.kpworthi.repl.co'; 

  suite('e2e Testing with Zombie.js', function() {
    const browser = new Browser();

    // With a headless browser, before the actual testing, we need to
    // **visit** the page we are going to inspect...
    // the suiteSetup 'hook' is executed only once at the suite startup.
    // Other different hook types can be executed before each test, after
    // each test, or at the end of a suite. See the Mocha docs for more infos.

    suiteSetup(function(done) { // Remember, web interactions are asynchronous !!
      return browser.visit('/', done);  // Browser asynchronous operations take a callback
    });

    suite('"Famous Italian Explorers" form', function() {
      
      // In the HTML main view we provided a input form.
      // It sends data to the "PUT /travellers" endpoint that we used above
      // with an Ajax request. When the request completes successfully the
      // client code appends a <div> containing the infos returned by the call
      // to the DOM.
      
      // ### EXAMPLE ###
      test('#example - submit the input "surname" : "Polo"', function(done) {
        browser
          .fill('surname', 'Polo')
          .pressButton('submit', function(){
            // pressButton is ## Async ##.  
            // It waits for the ajax call to complete...

            //assert that status is OK 200
            browser.assert.success();
            //element 'span#name' is 'Marco'
            browser.assert.text('span#name', 'Marco');
            //element 'span#surname' is 'Polo'
            browser.assert.text('span#surname', 'Polo');
            //'span#dates' exist and their count is 1
            browser.assert.element('span#dates', 1);

            done();   // It's an async test, so we have to call 'done()''
          });
      });

      /** Now it's your turn. Please don't use the keyword #example in the title. **/
      
      test('submit "surname" : "Colombo"', function(done) {

        // in the callback...
        // assert that status is OK 200
        // assert that the text inside the element 'span#name' is 'Cristoforo'
        // assert that the text inside the element 'span#surname' is 'Colombo'
        // assert that the element(s) 'span#dates' exist and their count is 1
        browser
          .fill('surname', 'Colombo')
          .pressButton('submit', function(){

            browser.assert.success();
            browser.assert.text('span#name', 'Cristoforo');
            browser.assert.text('span#surname', 'Colombo');
            browser.assert.element('span#dates', 1);
            
            done();   //
          });
        // 
      });
      
      test('submit "surname" : "Vespucci"', function(done) {

        browser.fill('surname', 'Vespucci')
               .pressButton('submit', function(err, res){
                 
                 browser.assert.success();
                 browser.assert.text('span#name', 'Amerigo');
                 browser.assert.text('span#surname', 'Vespucci');
                 browser.assert.element('span#dates', 1);

                 done();
               });
      
      });
    });
  });
});
