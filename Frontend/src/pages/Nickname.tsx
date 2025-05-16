import { Link } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import NicknameAtom from "../atoms/NicknameAtom";

const NickName=()=>{
    const setNickname=useSetRecoilState(NicknameAtom);
    return <div>
        Nickname
        <input placeholder="Enter your nickname" onChange={(e)=>{
            setNickname(e.target.value);
        }}></input>
        {/* <button >Chat</button> */}
        <Link to={'/chat'}>Chat</Link>
    </div>
}

export default NickName;