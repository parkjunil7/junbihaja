import {useEffect,useState} from "react";
import {db} from "./db";
import Studio from "./studio";

export default function Passport(){
  const [member,setMember]=useState<string|null|undefined>(undefined);
  const [error,setError]=useState(""),[busy,setBusy]=useState(false);
  useEffect(()=>{
    const {data}=db.auth.onAuthStateChange((_event,session)=>setMember(session?.user.id??null));
    return ()=>data.subscription.unsubscribe();
  },[]);
  async function login(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();if(busy)return;
    const form=new FormData(e.currentTarget);
    setBusy(true);setError("");
    try{
      const {data,error}=await db.functions.invoke("member-login",{body:{username:String(form.get("username")).trim(),password:form.get("password")}});
      if(error){const status=error.context?.status;throw Error(status===401?"아이디와 비밀번호를 확인해 주세요.":status===429?"잠시 후 다시 로그인해 주세요.":"로그인 서버에 연결하지 못했어요.");}
      const result=await db.auth.setSession(data);
      if(result.error)throw Error("로그인 세션을 열지 못했어요.");
    }catch(e){setError(e instanceof Error?e.message:"로그인하지 못했어요.");}finally{setBusy(false);}
  }
  if(member)return <Studio key={member} onLogout={async()=>{const result=await db.auth.signOut({scope:"local"});if(result.error)throw result.error;}}/>;
  return <main className="skyGate"><article className="gatePass"><header className="gateArt"><div><strong>준비하자</strong><h1>웨딩 여권</h1><p>우리 둘의 웨딩 투어</p></div><img src="./passport.webp" alt="여권과 청첩장을 챙긴 두 고양이"/></header>
    <section className="gateForm"><h2>여권 열기</h2>{member===undefined?<p role="status">여권을 확인하고 있어요.</p>:<form onSubmit={login}><p>모아보자에서 쓰는 아이디와 비밀번호로 로그인해 주세요.</p>
    <label>아이디<input autoComplete="username" name="username" required maxLength={256} autoCapitalize="none"/></label>
    <label>비밀번호<input autoComplete="current-password" name="password" type="password" required/></label>
    <button disabled={busy} className="primary">{busy?"여는 중…":"로그인"}</button></form>}{error&&<p role="alert" className="error">{error}</p>}</section></article></main>;
}
