define(['peaks', 'waveform-data', 'Kinetic'], function(Peaks, WaveformData, Kinetic){
  describe("Peaks API interface", function () {

    var sandbox;

    /**
     * SETUP =========================================================
     */

    beforeEach(function beforeEach(done) {
      loadAllFixtures();
      sandbox = sinon.sandbox.create();
      done();
    });

    /**
     * TEARDOWN ======================================================
     */

    afterEach(function (done) {
      removeAllFixtures();
      sandbox.restore();
      done();
    });

    /**
     * TESTS =========================================================
     */
    describe("create", function(){
      it("should throw an exception if no mediaElement is provided", function(){
        expect(function(){
          Peaks.init({
            container: document.getElementById('waveform-visualiser-container'),
            dataUri: { arraybuffer: 'base/test_data/sample.dat' }
          });
        }).to.throw(/provide an audio element/);
      });

      it("should throw an exception if mediaElement is not an HTMLMediaElement", function(){
        expect(function(){
          Peaks.init({
            container: document.getElementById('waveform-visualiser-container'),
            mediaElement: document.createElement('div'),
            dataUri: { arraybuffer: 'base/test_data/sample.dat' }
          });
        }).to.throw(/HTMLMediaElement/);
      });

      it("should thrown an exception if no container is provided", function(){
        expect(function(){
          Peaks.init({
            mediaElement: document.querySelector('audio'),
            dataUri: { arraybuffer: 'base/test_data/sample.dat' }
          });
        }).to.throw(/provide a container/);
      });

      it("should thrown an exception if the container has no layout", function(){
        expect(function(){
          Peaks.init({
            mediaElement: document.querySelector('audio'),
            container: document.createElement('div'),
            dataUri: { arraybuffer: 'base/test_data/sample.dat' }
          });
        }).to.throw(/width/);
      });
    });

    describe('core#getRemoteData', function(){
      it("should use the dataUriDefaultFormat value as a format URL if dataUri is provided as string", function(done){
        var p = Peaks.init({
          container: document.getElementById('waveform-visualiser-container'),
          mediaElement: document.querySelector('audio'),
          dataUri: 'base/test_data/sample.json'
        });

        var spy = sandbox.spy(p.waveform, 'handleRemoteData');

        p.on('segments.ready', function(){
          var xhr = spy.getCall(0).args[1];

          expect(xhr.getResponseHeader('content-type')).to.equal('application/json');

          done();
        });
      });

      it("should use the JSON dataUri connector", function(done){
        var p = Peaks.init({
          container: document.getElementById('waveform-visualiser-container'),
          mediaElement: document.querySelector('audio'),
          dataUri: {
            json: 'base/test_data/sample.json'
          }
        });

        var spy = sandbox.spy(p.waveform, 'handleRemoteData');

        p.on('segments.ready', function(){
          var xhr = spy.getCall(0).args[1];

          expect(xhr.getResponseHeader('content-type')).to.equal('application/json');

          done();
        });
      });

      ('ArrayBuffer' in window) && it("should use the arraybuffer dataUri connector or fail if not available", function(done){
        var p = Peaks.init({
          container: document.getElementById('waveform-visualiser-container'),
          mediaElement: document.querySelector('audio'),
          dataUri: {
            arraybuffer: 'base/test_data/sample.dat'
          }
        });

        var spy = sandbox.spy(p.waveform, 'handleRemoteData');

        p.on('segments.ready', function(){
          var xhr = spy.getCall(0).args[1];

          expect(xhr.getResponseHeader('content-type')).to.equal('text/plain');

          done();
        });
      });

      !('ArrayBuffer' in window) && it("should throw an exception if the only available format is browser incompatible", function(){
        expect(function() {
          Peaks.init({
            container: document.getElementById('waveform-visualiser-container'),
            mediaElement: document.querySelector('audio'),
            dataUri: {
              arraybuffer: 'base/test_data/sample.dat'
            }
          });
        }).to.throw();
      });

      it("should pick the arraybuffer format over the JSON one", function(done){
        var p = Peaks.init({
          container: document.getElementById('waveform-visualiser-container'),
          mediaElement: document.querySelector('audio'),
          dataUri: {
            arraybuffer: 'base/test_data/sample.dat',
            json: 'base/test_data/sample.json'
          }
        });

        var spy = sandbox.spy(p.waveform, 'handleRemoteData');
        var expectedContentType = Boolean(window['ArrayBuffer']) ? 'text/plain' : 'application/json';

        p.on('segments.ready', function(){
          var xhr = spy.getCall(0).args[1];

          expect(xhr.getResponseHeader('content-type')).to.equal(expectedContentType);

          done();
        });
      });

      ('AudioBuffer' in window) && it("should build using WebAudio if the API is available and no dataUri is provided", function(done){
        var p = Peaks.init({
          container: document.getElementById('waveform-visualiser-container'),
          mediaElement: document.querySelector('audio')
        });

        var spy = sandbox.spy(p.waveform, 'handleRemoteData');

        p.on('segments.ready', function(){
          expect(spy).to.have.been.calledOnce;

          done();
        });
      });
    });

  });

});
