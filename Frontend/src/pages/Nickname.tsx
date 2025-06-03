import {  useSetRecoilState } from "recoil";
import NicknameAtom from "../atoms/NicknameAtom";
import groupLinkAtom from "../atoms/groupLinkAtom";
import { useNavigate } from "react-router-dom";


const NickName=()=>{
    const setNickname=useSetRecoilState(NicknameAtom);
    const setgrouplink=useSetRecoilState(groupLinkAtom);

    const navigate=useNavigate();

    return <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center px-4">
    <div className="w-full max-w-4xl bg-gray-800 rounded-2xl shadow-lg p-10 space-y-12">
      
      <h2 className="text-3xl font-bold text-white text-center">Join or Create a Group</h2>
        <div className="flex flex-col items-center space-y-2">
        <label className="text-lg font-semibold text-white">Your Nickname</label>
        <input
          className="w-72 px-4 py-2 rounded-md bg-gray-900 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-white focus:outline-none"
          placeholder="Enter your nickname"
          onChange={(e) => {
            setNickname(e.target.value);
          }}
        />
      </div>
  
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
        
        <div className="flex flex-col items-center space-y-4">
          <button
            className="w-48 bg-white text-black py-2 px-6 rounded-md font-semibold hover:bg-gray-200 transition"
            onClick={() => {
              setgrouplink(Math.random().toString(36).substring(2, 8));
              navigate('/chat');
            }}
          >
            Create Code
          </button>
          <p className="text-gray-400 text-sm text-center">Generate a new group code to share with friends</p>
        </div>
  
        <div className="flex flex-col items-center space-y-4">
          <input
            className="w-72 px-4 py-2 rounded-md bg-gray-900 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-white focus:outline-none"
            placeholder="Enter Group Code"
            onChange={(e) => {
              setgrouplink(e.target.value);
            }}
          />
          <button
            className="w-48 bg-white text-black py-2 px-6 rounded-md font-semibold hover:bg-gray-200 transition"
            onClick={() => {
              navigate('/chat');
            }}
          >
            Enter Group
          </button>
          <p className="text-gray-400 text-sm text-center">Already have a group code? Join here</p>
        </div>
  
      </div>
    </div>
  </div>
  
  
  
}

export default NickName;