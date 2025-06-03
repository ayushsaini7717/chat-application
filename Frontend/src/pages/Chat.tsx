import { useEffect, useState } from "react";
import NicknameAtom from "../atoms/NicknameAtom";
import { useRecoilValue } from "recoil";
import groupLinkAtom from "../atoms/groupLinkAtom";

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
  const [ActiveUsers,SetActiveUsers]=useState<string[]>([]);
  // const [isTyping,SetisTyping]=useState(false);
  
  
  const grouplink=useRecoilValue(groupLinkAtom);
  const NicknameValue=useRecoilValue(NicknameAtom);
  
  useEffect(()=>{
    // const ws=new WebSocket("ws://localhost:3000");
    const ws = new WebSocket('wss://chat-application-0gjv.onrender.com');
    setSocket(ws);

    ws.onopen=()=>{
      const NicknameToSend={
        type: 'Nickname',
        value: NicknameValue.toString(),
        grouplink:grouplink
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
        SetServerMsg(prev=>[...prev,parsedMessage.msg]);
        SetActiveUsers(parsedMessage.users);
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
        <div className="flex h-screen bg-gray-900 text-white">
      <div className="w-72 bg-gray-800 p-4 flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-semibold mb-2">Share Code</h2>
          <div className="bg-gray-700 p-2 rounded-md text-sm break-words mb-6">
            {grouplink}
          </div>

          <h3 className="text-md font-medium mb-2">Active Users</h3>
          <div className="space-y-1 mb-6 max-h-40 overflow-y-auto">
            {ActiveUsers.map((username) => (
              <div
                key={username}
                className="py-1 px-2 bg-gray-700 rounded-md text-sm"
              >
                {username}
              </div>
            ))}
          </div>

          <h4 className="text-md font-semibold mb-2">Server Messages</h4>
          <div className="bg-gray-700 p-2 rounded-md text-sm space-y-1 max-h-40 overflow-y-auto">
            {ServerMsg.length > 0 ? (
              ServerMsg.map((item, i) => (
                <div key={i} className="text-gray-300">
                  {i + 1} - {item}
                </div>
              ))
            ) : (
              <div className="text-gray-500">No server messages</div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 bg-gray-800 border-b border-gray-700">
          <h1 className="text-xl font-bold text-white text-center flex-1">
            Hello, {NicknameValue}
          </h1>
          <div className="text-sm text-gray-300">Online: {online}</div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-32">
          {last10msg.length > 0 && (
            <div className="mb-4">
              <h3 className="text-md font-semibold text-gray-300 mb-2">
                Last 10 Messages
              </h3>
              {last10msg.map((item, i) => (
                <div key={i} className="text-sm text-gray-200">
                  {item.sender} — {item.msg}
                </div>
              ))}
            </div>
          )}

          {currentTypeUser.map((item, i) => (
            <div key={i} className="text-xs text-gray-400 italic">
              {item} is typing...
            </div>
          ))}

          <div>
            <h3 className="text-md font-semibold text-gray-300 mb-2">Messages</h3>
            {Message.map((item, i) => (
              <div key={i} className="text-sm">
                <span className="font-semibold text-blue-400">{item.Nickname}</span> — {item.msg}
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-800 border-t border-gray-700 flex items-center space-x-4">
          <input
            type="text"
            placeholder="Type your message..."
            onChange={(e) => {
              SetTypemsg(e.target.value);
              const TypingInfoSend = {
                type: "isTyping",
                value: true,
                grouplink: grouplink,
              };
              socket?.send(JSON.stringify(TypingInfoSend));
              setTimeout(() => {
                TypingInfoSend.value = false;
                socket?.send(JSON.stringify(TypingInfoSend));
              }, 3000);
            }}
            className="flex-1 px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => {
              const DataToSend = {
                type: "chat",
                value: typemsg,
                grouplink: grouplink,
              };
              socket?.send(JSON.stringify(DataToSend));
            }}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md font-semibold"
          >
            Send
          </button>
        </div>
      </div>
    </div>



    // <div>
    //   <div>
    //     Active Users:
    //     {ActiveUsers.map((username)=>{
    //       return <div key={username}>{username}</div>
    //     })}
    //   </div>
    //   <div>share this code to your friends to join --{grouplink}</div>
    //   <br></br><br></br>
    //     <div>
    //        hii {NicknameValue}
    //       <h3>online: {online}</h3>
    //       <input onChange={(e)=>{
    //         SetTypemsg(e.target.value);
    //         // SetisTyping(true);
    //         let TypingInfoSend={
    //           type: "isTyping",
    //           value: true,
    //           grouplink: grouplink
    //         }
    //         socket?.send(JSON.stringify(TypingInfoSend));
    //         setTimeout(()=>{
    //           TypingInfoSend.value=false;
    //           socket?.send(JSON.stringify(TypingInfoSend));
    //         },3000)
    //       }} type="text"></input>
    //       <button onClick={()=>{
    //         const DataToSend={
    //             type: 'chat',
    //             value: typemsg,
    //             grouplink: grouplink
    //         }
    //         socket?.send(JSON.stringify(DataToSend));
    //       }}>Send</button>
    //     </div>

    //     <h4>server Messages:</h4>
    //     {ServerMsg.length <= 0 ? null :ServerMsg.map((item,i)=>{
    //       return <div key={i}>{i+1} - {item}</div>
    //     })}
        
    //     {last10msg.length > 0?<div>
    //       <h3>last 10 messages</h3>
    //       {last10msg.map((item,i)=>{
    //         return <div key={i}>
    //           {item.sender}-{item.msg}
    //         </div>
    //       })}
    //     </div>:null}

    //     <h3>Messages:</h3>
    //     {currentTypeUser.map((item,i)=>{
    //       return <span key={i}>{item} is Typing...</span>
    //     })}
    //     {Message.map((item,i)=>{
    //       return <div key={i}>
    //         {item.Nickname} - {item.msg}
    //       </div>
    //     })}
    // </div>
  )
}

export default Chat
