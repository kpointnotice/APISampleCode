const inputId = document.getElementById('inputId');
const inputPw = document.getElementById('inputPw');
const loginBtn = document.getElementById('loginBtn');
 
loginBtn.addEventListener('click', function (e) {
    let loginData = {
        eventOp: 'Login',
        reqNo: reqNumber(),
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
            console.log(' there was a syntaxError it and try again : ' + err.message);
        } else {
            throw err;
        }
    }
});
 
 
signalSocketIo.on('knowledgetalk', function (data) {
    console.log('receive', data);
    if (!data.eventOp && !data.signalOp) {
        console.log('error', 'eventOp undefined');
    }
});