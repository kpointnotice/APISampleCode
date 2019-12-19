document.addEventListener('DOMContentLoaded', function() {
    const inputId = document.getElementById('inputId');
    const inputPw = document.getElementById('inputPw');
    const inputTarget = document.getElementById('inputTarget');
    const loginBtn = document.getElementById('loginBtn');
    const callBtn = document.getElementById('callBtn');
    const localVideo = document.getElementById('localVideo');
    const remoteVideo = document.getElementById('remoteVideo');
    const whiteboardBtn = document.getElementById('whiteboardBtn');
    const whiteboard = document.getElementById('whiteboard');
   
    let reqNo = 1;
    let peerCon;
    let localStream;
    let roomId;
    let configuration;
   
    signalSocketIo.on('knowledgetalk', function(data) {
      console.log('receive', data);
   
      if (!data.eventOp && !data.signalOp) {
        console.log('error', 'eventOp undefined');
      }
   
      if (data.eventOp === 'Login') {
        loginBtn.disabled = true;
        callBtn.disabled = false;
      }
   
      if (data.eventOp === 'Call') {
        callBtn.disabled = true;
        whiteboardBtn.disabled = false;
        whiteboardClearBtn.disabled = false;
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: false })
          .then(stream => {
            localStream = stream;
            localVideo.srcObject = stream;
          });
      }
   
      if (data.eventOp === 'SDP') {
        if (data.sdp.type === 'offer') {
          roomId = data.roomId;
          peerCon = new RTCPeerConnection(configuration);
   
          peerCon.onicecandidate = onIceCandidateHandler;
          peerCon.onaddstream = onAddStreamHandler;
   
          peerCon.addStream(localStream);
   
          peerCon.setRemoteDescription(new RTCSessionDescription(data.sdp));
          peerCon.createAnswer().then(sdp => {
            peerCon.setLocalDescription(new RTCSessionDescription(sdp));
   
            let ansData = {
              eventOp: 'SDP',
              sdp,
              useMediaSvr: 'N',
              userId: inputId.value,
              roomId,
              reqNo: reqNo++,
              reqDate: nowDate()
            };
   
            try {
              console.log('send', ansData);
              signalSocketIo.emit('knowledgetalk', ansData);
            } catch (err) {
              if (err instanceof SyntaxError) {
                alert(
                  ' there was a syntaxError it and try again : ' + err.message
                );
              } else {
                throw err;
              }
            }
          });
        }
      }
   
      if (data.eventOp === 'Candidate') {
        if (!data.candidate) return;
        peerCon.addIceCandidate(new RTCIceCandidate(data.candidate));
   
        let iceData = {
          eventOp: 'Candidate',
          roomId: data.roomId,
          reqNo: data.reqNo,
          resDate: nowDate(),
          code: '200'
        };
   
        try {
          console.log('send', iceData);
          signalSocketIo.emit('knowledgetalk', iceData);
        } catch (err) {
          if (err instanceof SyntaxError) {
            alert(' there was a syntaxError it and try again : ' + err.message);
          } else {
            throw err;
          }
        }
      }
    });
   
    function onIceCandidateHandler(e) {
      if (!e.candidate) return;
   
      let iceData = {
        eventOp: 'Candidate',
        candidate: e.candidate,
        useMediaSvr: 'N',
        userId: inputId.value,
        roomId,
        reqNo: reqNo++,
        reqDate: nowDate()
      };
   
      try {
        console.log('send', iceData);
        signalSocketIo.emit('knowledgetalk', iceData);
      } catch (err) {
        if (err instanceof SyntaxError) {
          alert(' there was a syntaxError it and try again : ' + err.message);
        } else {
          throw err;
        }
      }
    }
   
    function onAddStreamHandler(e) {
      remoteVideo.srcObject = e.stream;
    }
   
    loginBtn.addEventListener('click', function(e) {
      let loginData = {
        eventOp: 'Login',
        reqNo: reqNo++,
        userId: inputId.value,
        userPw: passwordSHA256(inputPw.value),
        reqDate: nowDate(),
        deviceType: 'pc'
      };
   
      try {
        console.log('send', loginData);
        signalSocketIo.emit('knowledgetalk', loginData);
      } catch (err) {
        if (err instanceof SyntaxError) {
          alert(' there was a syntaxError it and try again : ' + err.message);
        } else {
          throw err;
        }
      }
    });
   
    callBtn.addEventListener('click', function(e) {
      let callData = {
        eventOp: 'Call',
        reqNo: reqNo++,
        reqDate: nowDate(),
        userId: inputId.value,
        targetId: [inputTarget.value],
        serviceType: 'call',
        reqDeviceType: 'pc'
      };
   
      try {
        console.log('send', callData);
        signalSocketIo.emit('knowledgetalk', callData);
      } catch (err) {
        if (err instanceof SyntaxError) {
          alert(' there was a syntaxError it and try again : ' + err.message);
        } else {
          throw err;
        }
      }
    });
   
    whiteboardBtn.addEventListener('click', function(e) {
      if (whiteboard.style.display === 'none') {
        whiteboard.style.display = 'inline-block';
        setPen();
      } else {
        context.clearRect(0, 0, whiteboard.width, whiteboard.height);
        whiteboard.style.display = 'none';
   
        let wbeData = {
          eventOp: 'WhiteBoardEnd',
          reqNo: reqNo++,
          roomId,
          reqDate: nowDate(),
          userId: inputId.value
        };
   
        try {
          console.log('send', wbeData);
          signalSocketIo.emit('knowledgetalk', wbeData);
        } catch (err) {
          if (err instanceof SyntaxError) {
            alert(' there was a syntaxError it and try again : ' + err.message);
          } else {
            throw err;
          }
        }
      }
    });
   
    whiteboardClearBtn.addEventListener('click', function(e) {
      context.clearRect(0, 0, whiteboard.width, whiteboard.height);
   
      let clearData = {
        signalOp: 'Reset',
        reqNo: reqNo++,
        reqDate: nowDate(),
        roomId
      };
   
      try {
        console.log('send', clearData);
        signalSocketIo.emit('knowledgetalk', clearData);
      } catch (err) {
        if (err instanceof SyntaxError) {
          alert(' there was a syntaxError it and try again : ' + err.message);
        } else {
          throw err;
        }
      }
    });
   
    let isDrawing = false;
    let context = whiteboard.getContext('2d');
   
    if (whiteboard) {
      let canvasX;
      let canvasY;
   
      whiteboard.addEventListener('mousedown', function(e) {
        isDrawing = true;
        canvasX = e.pageX - whiteboard.offsetLeft;
        canvasY = e.pageY - whiteboard.offsetTop;
   
        drawing('start', canvasX, canvasY);
   
        context.beginPath();
        context.moveTo(canvasX, canvasY);
      });
      whiteboard.addEventListener('mousemove', function(e) {
        if (isDrawing === false) return;
   
        drawing('move', canvasX, canvasY);
   
        canvasX = e.pageX - whiteboard.offsetLeft;
        canvasY = e.pageY - whiteboard.offsetTop;
        context.lineTo(canvasX, canvasY);
        context.stroke();
      });
      whiteboard.addEventListener('mouseup', function(e) {
        isDrawing = false;
   
        drawing('end', canvasX, canvasY);
   
        context.closePath();
      });
    }
   
    function setPen() {
      context.globalCompositeOperation = 'source-over';
      context.lineJoin = 'round';
      context.lineCap = 'round';
      context.strokeStyle = 'black';
      context.lineWidth = '5';
    }
   
    function drawing(status, axisX, axisY) {
      let drawData = {
        signalOp: 'Draw',
        axisX,
        axisY,
        boardWidth: whiteboard.width,
        boardHeight: whiteboard.height,
        status,
        roomId
      };
   
      try {
        console.log('send', drawData);
        signalSocketIo.emit('knowledgetalk', drawData);
      } catch (err) {
        if (err instanceof SyntaxError) {
          alert(' there was a syntaxError it and try again : ' + err.message);
        } else {
          throw err;
        }
      }
    }
  });