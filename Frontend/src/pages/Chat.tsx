import { useEffect, useState } from "react";
import NicknameAtom from "../atoms/NicknameAtom";
import { useRecoilValue } from "recoil";

interface messagescheme{
  msg: string,
  Nickname: string
}

interface lastmessageScheme{
  sender: string,
  msg: string
}

function Chat() {
  const [socket,setSocket]=useState<WebSocket | null>(null);
  const [Message,Setmessage]=useState<messagescheme[]>([]);
  const [typemsg,SetTypemsg]=useState("");
  const [online,setOnline]=useState(0);
  const [ServerMsg,SetServerMsg]=useState<string[]>([]);
  const [currentTypeUser,SetCurrentTypeUser]=useState<string[]>([]);
  const [last10msg,Setlast10msg]=useState<lastmessageScheme[]>([]);
  // const [isTyping,SetisTyping]=useState(false);

  const NicknameValue=useRecoilValue(NicknameAtom);
  
  useEffect(()=>{
    const ws=new WebSocket("ws://localhost:3000");
    setSocket(ws);

    ws.onopen=()=>{
      const NicknameToSend={
        type: 'Nickname',
        value: NicknameValue.toString()
      }
      ws.send(JSON.stringify(NicknameToSend));
      console.log("Connected to server!");
    }

    ws.onmessage=(message)=>{
      console.log(message);
      const parsedMessage=JSON.parse(message.data);
      
      if(parsedMessage.type === "online"){
        setOnline(parsedMessage.count);
      }else if(parsedMessage.type === "last10"){
        Setlast10msg(prev=>[...prev,{sender: parsedMessage.sender,msg: parsedMessage.msg}]);
      }
      else if(parsedMessage.type === "chat"){
        Setmessage(prev=>[...prev,{msg: parsedMessage.msg,Nickname: parsedMessage.Nickname}]);
      }else if(parsedMessage.type === "info"){
        SetServerMsg(prev=>[...prev,parsedMessage.msg])
      }else if(parsedMessage.type === "UserTyping"){
        if(parsedMessage.Istyping === true){
          SetCurrentTypeUser(prev => {
            if (!prev.includes(parsedMessage.name)) {
                return [...prev, parsedMessage.name];
            }
            return prev;
        });
        }else{
          // let ind=currentTypeUser.findIndex((item)=>item===parsedMessage.name);
          // SetCurrentTypeUser(currentTypeUser.splice(ind,1));
          SetCurrentTypeUser(prev=>prev.filter(user=>user!==parsedMessage.name));
        }
      }
    }

    ws.onclose=()=>{
      console.log("Disconnected from the server!");
    }

    return ()=>{
      ws.close();
    }
  },[])
  return (
    <div>
        <div>
           hii {NicknameValue}
          <h3>online: {online}</h3>
          <input onChange={(e)=>{
            SetTypemsg(e.target.value);
            // SetisTyping(true);
            let TypingInfoSend={
              type: "isTyping",
              value: true
            }
            socket?.send(JSON.stringify(TypingInfoSend));
            setTimeout(()=>{
              TypingInfoSend.value=false;
              socket?.send(JSON.stringify(TypingInfoSend));
            },3000)
          }} type="text"></input>
          <button onClick={()=>{
            const DataToSend={
                type: 'chat',
                value: typemsg
            }
            socket?.send(JSON.stringify(DataToSend));
          }}>Send</button>
        </div>

        <h4>server Messages:</h4>
        {ServerMsg.length <= 0 ? null :ServerMsg.map((item,i)=>{
          return <div key={i}>{i+1} - {item}</div>
        })}
        
        {last10msg.length > 0?<div>
          <h3>last 10 messages</h3>
          {last10msg.map((item,i)=>{
            return <div key={i}>
              {item.sender}-{item.msg}
            </div>
          })}
        </div>:null}

        <h3>Messages:</h3>
        {currentTypeUser.map((item,i)=>{
          return <span key={i}>{item} is Typing...</span>
        })}
        {Message.map((item,i)=>{
          return <div key={i}>
            {item.Nickname} - {item.msg}
          </div>
        })}
    </div>
  )
}

export default Chat
