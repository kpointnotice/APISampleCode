
document.addEventListener('DOMContentLoaded', function () {
    let inputId = document.getElementById('inputId')
    let inputPw = document.getElementById('inputPw')
    let inputName = document.getElementById('inputName')
    let loginBtn = document.getElementById('loginBtn')
   
    let reqNo = 1
   
    signalSocketIo.on('knowledgetalk', function (data) {
      console.log('receive', data);
   
      if (!data.eventOp && !data.signalOp) {
        console.log('error', 'eventOp undefined');
      }
    });
   
   
    loginBtn.addEventListener('click', function (e) {
      let signupData = {
        eventOp: 'SignUp',
        reqNo: reqNo++,
        reqDate: nowDate(),
        userId: inputId.value,
        userPw: passwordSHA256(inputPw.value),
        userName: inputName.value,
        deviceType: 'pc'
      }
   
      try {
        console.log('send', signupData);
        signalSocketIo.emit('knowledgetalk', signupData);
      } catch (err) {
        if (err instanceof SyntaxError) {
          alert(' there was a syntaxError it and try again : ' + err.message);
        } else {
          throw err;
        }
      }
    });
  });