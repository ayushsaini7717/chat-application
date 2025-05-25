import { Link } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import NicknameAtom from "../atoms/NicknameAtom";
import groupLinkAtom from "../atoms/groupLinkAtom";

const NickName=()=>{
    const setNickname=useSetRecoilState(NicknameAtom);
    const setgrouplink=useSetRecoilState(groupLinkAtom);
    return <div>
        Nickname
        <input placeholder="Enter your nickname" onChange={(e)=>{
            setNickname(e.target.value);
        }}></input>
        <label>grouplink</label>
        <input placeholder="Enter Grouplink" onChange={(e)=>{
            setgrouplink(e.target.value);
        }}></input>
        {/* <button >Chat</button> */}
        <Link to={'/chat'}>Chat</Link>
    </div>
}

export default NickName;