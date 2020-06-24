document.addEventListener('DOMContentLoaded',function(){
    const inputId = document.getElementById('inputid');
    const inputPw = document.getElementById('inputpw');
    const inputTarget = document.getElementById('inputTarget');
    const loginBtn = document.getElementById('loginBtn');
    const callBtn = document.getElementById('callBtn');
    const exitBtn = document.getElementById('exitBtn');
    const chatBtn = document.getElementById('chatBtn');
    const message = document.getElementById('message');
    const messageFrom = document.getElementById('messageFrom');
    
    let reqNo = 1;
    
    loginBtn.addEventListener('click',function(e){
        let loginData = {
            eventOp: 'Login',
            reqNo: reqNo++,
            userId: inputId.value,
            userPw: passwordSHA256(inputPw.value),
            reqDate: nowDate(),
            deviceType: 'pc'
        };
    
        try {
            tLogBox('send(login)', loginData);
            signalSocketIo.emit('knowledgetalk', loginData);
        } catch (err) {
            if(err instanceof SyntaxError){
                alert('there was a syntaxError it and try again : ' + err.message);
            } else {
                throw err;
            }
        }
    });
    
    callBtn.addEventListener('click', function (e){
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
            tLogBox('send(call)', callData);
            signalSocketIo.emit('knowledgetalk', callData);
        } catch (err) {
            if(err instanceof SyntaxError){
                alert('there was a syntaxError it and try again : ' + err.message);
            } else {
                throw err;
            }
        }
    
    });
    
    exitBtn.addEventListener('click', function(e){
        let callEndData = {
            eventOp: 'ExitRoom',
            reqNo: reqNo,
            userId: inputId.value,
            reqDate: nowDate(),
            roomId
        };
    
        try {
            tLogBox('send', callEndData);
            signalSocketIo.emit('knowledgetalk', callEndData);
        } catch (err) {
            if (err instanceof SyntaxError) {
                alert('there was a syntaxError it and try again:' + err.message);
            } else {
                throw err;
            }
        }
    });
 
    chatBtn.addEventListener('click',function(e){
        let chatData = {
            signalOp: 'Chat',
            userId: inputId.value,
            message: message.value
        }
 
        try {
            tLogBox('send',chatData);
            signalSocketIo.emit('knowledgetalk', chatData);
        } catch (err) {
            if (err instanceof SyntaxError) {
                alert(' there was a syntaxError it and try again : ' + err.message);
            } else {
                throw err;
            }
        }
    });
    
    signalSocketIo.on('knowledgetalk',function(data){
        tLogBox('receive',data);
    
        if(!data.eventOp && !data.signalOp){
            tLogBox('error', 'eventOp undefined');
        }
 
        if (data.eventOp === 'Login') {
            loginBtn.disabled = true;
            callBtn.disabled = false;
        }
    
        if(data.eventOp === 'Call'){
            if(data.message !== 'OK'){
                return;
            }
    
            callBtn.disabled = true;
        }
 
        if(data.signalOp === 'Chat'){
            messageFrom.value = data.userId + ' : ' + data.message;
        }
    
    });
 
})