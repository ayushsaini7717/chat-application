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

        if(DataRecieved.type === 'chat'){
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
