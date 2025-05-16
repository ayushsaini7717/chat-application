import WebSocket from 'ws';

const wss=new WebSocket.Server({port : 3000});
const Sockets=new Map();
const NameMap=new Map();
let currId=1;

wss.on("connection",(ws)=>{
    console.log(`user ${currId} connected!`);
    Sockets.set(currId,ws);
    const UserId=currId;
    currId++;
    ws.send(Sockets.size.toString());
    
    let onlineStatus={
        type: "online",
        count: Sockets.size
    }
    
    ws.on("message",(data)=>{
        const DataRecieved=JSON.parse(data.toString());
        // console.log(DataRecievedFormat);
        
        if(DataRecieved.type === 'chat'){
            const DataRecievedFormat=DataRecieved.value.split(' ');
            if(DataRecievedFormat[0] === "\\w"){
                let userId;
                for(let [key,value] of NameMap.entries()){
                    if(value === DataRecievedFormat[1]){
                        userId=key;
                        break;
                    }
                }
                let messageToSend={
                    type: "chat",
                    msg: DataRecieved.value.slice(3,DataRecieved.value.length+1),
                    Nickname: NameMap.get(userId) || "me2"
                }
                if(userId === undefined){
                    const curruser=Sockets.get(UserId);
                    messageToSend.msg="Not find any user with Nickname provided by you!";
                    console.log("curruser ",curruser);
                    curruser.send(JSON.stringify(messageToSend));
                }else{
                    const sender=Sockets.get(userId);
                    sender.send(JSON.stringify(messageToSend));
                }
            }else{
                Sockets.forEach((value,key)=>{
                    if(key !== UserId){
                        console.log("recieves message ",data.toString());
                        let messageToSend={
                            type: "chat",
                            msg: DataRecieved.value,
                            Nickname: NameMap.get(UserId)
                        }
                        value.send(JSON.stringify(messageToSend));
                    }else{
                        let messageToSend={
                            type: "chat",
                            msg: DataRecieved.value,
                            Nickname: 'Me'
                        }
                        value.send(JSON.stringify(messageToSend));
                    }
                })
            }
        }else if(DataRecieved.type === 'Nickname'){
            NameMap.set(UserId,DataRecieved.value);
            let onconnectionMessage={
                type: "info",
                msg: `${NameMap.get(UserId)} has joined the chat!`,
            }

            Sockets.forEach((value,key)=>{
                if(key !== UserId){
                    value.send(JSON.stringify(onconnectionMessage));
                }
                value.send(JSON.stringify(onlineStatus));
            })
        }else if(DataRecieved.type === 'isTyping'){
            Sockets.forEach((value,key)=>{
                if(key !== UserId){
                    const TypingInfoSend={
                        type: "UserTyping",
                        name: NameMap.get(UserId),
                        Istyping: DataRecieved.value
                    }
                    value.send(JSON.stringify(TypingInfoSend));
                }
            })
        }
        
    })

    ws.on("close",()=>{
        let onDisconnetMessage={
            type: "info",
            msg: `${NameMap.get(UserId)} has left the chat.`,
        }
        Sockets.forEach((value,key)=>{
            if(key !== UserId){
                value.send(JSON.stringify(onDisconnetMessage));
            }
            value.send(JSON.stringify(onlineStatus));
        })
        console.log(`${NameMap.get(UserId)} disconnected!`);
        Sockets.delete(UserId);
        NameMap.delete(UserId);
    })
})
