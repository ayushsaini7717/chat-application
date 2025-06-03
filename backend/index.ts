import WebSocket from 'ws';

const wss=new WebSocket.Server({port : 3000});
const Sockets=new Map();
const NameMap=new Map();
const Groups=new Map();
const LastmsgMap=new Map();


let currId=1;

wss.on("connection",(ws)=>{
    console.log(`user ${currId} connected!`);
    Sockets.set(currId,ws);
    const UserId=currId;
    let Grouplink="";
    currId++;
    ws.send(Sockets.size.toString());

    let onlineStatus={
        type: "online",
        count: Sockets.size,
    }

    // Sends last 10 messages to new user connected
    
    
    
    ws.on("message",(data)=>{
        const DataRecieved=JSON.parse(data.toString());
        
        if(DataRecieved.type === 'chat'){

            // Wisper logic
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
                // Broadcast message in group
                let SocketsinGroup = Groups.get(DataRecieved.grouplink);
                if (!SocketsinGroup) return; // Add group existence check
                
                // Store message for all group members
                if (!LastmsgMap.has(DataRecieved.grouplink)) {
                    LastmsgMap.set(DataRecieved.grouplink, []);
                }
                
                const last10 = LastmsgMap.get(DataRecieved.grouplink);
                const messageToStore = {
                    type: "last10",
                    sender: NameMap.get(UserId),
                    msg: DataRecieved.value
                };
                
                if (last10.length >= 10) {
                    last10.shift(); // remove oldest message
                }
                last10.push(messageToStore); 

                // let SocketsinGroup=Groups.get(DataRecieved.grouplink);
                console.log("groups members are :",SocketsinGroup);
                Sockets.forEach((value,key)=>{
                    if(SocketsinGroup instanceof Set && key !== UserId && SocketsinGroup.has(key)){
                        console.log("recieves message ",data.toString());
                        let messageToSend={
                            type: "chat",
                            msg: DataRecieved.value,
                            Nickname: NameMap.get(UserId)
                        }
                        value.send(JSON.stringify(messageToSend));
                    }else if(SocketsinGroup.has(key)){
                        // Sends back message to me
                        let messageToSend={
                            type: "chat",
                            msg: DataRecieved.value,
                            Nickname: 'Me'
                        }

                        
                        value.send(JSON.stringify(messageToSend));
                    }else{
                        console.log(" Invalid group");
                    }
                })
            }
        }else if(DataRecieved.type === 'Nickname'){
            // add grouplink in set of Groups map
            NameMap.set(UserId,DataRecieved.value);
            Grouplink=DataRecieved.grouplink;
            
            if(!Groups.has(DataRecieved.grouplink)){
                Groups.set(DataRecieved.grouplink,new Set());
            }
            
            Groups.get(DataRecieved.grouplink).add(currId-1);
            let ActiveUsers: any[]=[];
            Groups.get(Grouplink).forEach((id:number)=>{
                ActiveUsers.push(NameMap.get(id));
            })
            let onconnectionMessage={
                type: "info",
                msg: `${NameMap.get(UserId)} has joined the chat!`,
                users: ActiveUsers
            }

            // create lastmessage groups
            if (LastmsgMap.has(Grouplink)) {
                const last10 = LastmsgMap.get(Grouplink);
                last10.forEach((msg: any) => {
                    ws.send(JSON.stringify(msg));
                });
            }

            Sockets.forEach((value,key)=>{
                if(Groups.get(Grouplink).has(key)){
                    value.send(JSON.stringify(onconnectionMessage));
                    onlineStatus.count=Groups.get(Grouplink).size;
                    // send online status
                    value.send(JSON.stringify(onlineStatus));
                }
            })
        }else if(DataRecieved.type === 'isTyping'){
            let SocketsinGroup=Groups.get(DataRecieved.grouplink);
            Sockets.forEach((value,key)=>{
                if(key !== UserId && SocketsinGroup.has(key)){
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
        console.log(`${NameMap.get(UserId)} disconnected!`);
        let user=NameMap.get(UserId);
        Sockets.delete(UserId);
        NameMap.delete(UserId);
        Groups.get(Grouplink).delete(UserId);
        let onDisconnetMessage={
            type: "info",
            msg: `${user} has left the chat.`,
            users: Array.from(NameMap.values())
        }
        Sockets.forEach((value,key)=>{
            if(key !== UserId){
                value.send(JSON.stringify(onDisconnetMessage));
            }
            // send online status
            onlineStatus.count=Groups.get(Grouplink).size;
            value.send(JSON.stringify(onlineStatus));
        })
    })
})
