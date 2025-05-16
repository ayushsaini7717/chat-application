import { BrowserRouter, Route, Routes } from "react-router-dom"
import Chat from "./pages/Chat"
import NickName from "./pages/Nickname"
import { RecoilRoot } from "recoil"

function App() {
  return <div>
    <RecoilRoot>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<NickName/>}></Route>
          <Route path="/chat" element={<Chat/>}></Route>
        </Routes>
      </BrowserRouter>
    </RecoilRoot>
  </div>
}

export default App
