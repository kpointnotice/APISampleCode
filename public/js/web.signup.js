
document.addEventListener('DOMContentLoaded', function () {
  let inputId = document.getElementById('inputId')
  let inputPw = document.getElementById('inputPw')
  let inputName = document.getElementById('inputName')
  let signupBtn = document.getElementById('signupBtn')

  let reqNo = 1

  signalSocketIo.on('knowledgetalk', function (data) {
    tLogBox('receive', data);

    if (!data.eventOp && !data.signalOp) {
      tLogBox('error', 'eventOp undefined');
    }

    if (data.eventOp === 'SignUp' && data.code ==='200'){
      tTextbox('회원가입이 되셨습니다.')
    }
    if (data.eventOp === 'SignUp' && data.code ==='409'){
      tTextbox('이미 가입되어 있는 ID입니다.')
    }
  });

  signupBtn.addEventListener('click', function (e) {

    //input 빈값 예외처리
    let inputArr = [inputId.value, inputPw.value, inputName.value];
    let checkBlank = false;
    inputArr.forEach((item) => {
      if(item.trim() === '' || item == null){
        tTextbox('빈칸을 모두 채워주세요.')
        checkBlank = true;
      }
    });

    if(!checkBlank){
      return;
    }

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
      tLogBox('send', signupData);
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
