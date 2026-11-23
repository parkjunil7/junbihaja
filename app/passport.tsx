import {useEffect,useState} from "react";
import {db} from "./db";
import Studio from "./studio";
import {Eye,EyeOff} from "lucide-react";
import "./garden-login.css";

export default function Passport(){
  const [member,setMember]=useState<string|null|undefined>(undefined);
  const [error,setError]=useState(""),[busy,setBusy]=useState(false);
  const [showPassword,setShowPassword]=useState(false);
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
  if(member)return <Studio key={member} memberId={member} onLogout={async()=>{const result=await db.auth.signOut({scope:"local"});if(result.error)throw result.error;}}/>;
  return <main className="gardenLogin"><article className="gardenCard">
    <header className="gardenPoster">
      <h1 className="sr">준비하자! 우리 둘의 웨딩 준비</h1>
      <img src="./garden-wedding.webp" width="829" height="803" fetchPriority="high" alt="데이지 꽃 아치 아래 나란히 앉은 두 고양이"/>
    </header>
    <section className="gardenForm" aria-label="모아보자 계정으로 로그인">
      {member===undefined?<p role="status">로그인 정보를 확인하고 있어요.</p>:<form onSubmit={login}>
        <div><label htmlFor="garden-user">아이디</label>
          <input id="garden-user" autoComplete="username" name="username" required maxLength={256} autoCapitalize="none" spellCheck={false}/></div>
        <div><label htmlFor="garden-password">비밀번호</label>
          <div className="gardenPassword"><input id="garden-password" autoComplete="current-password" name="password" type={showPassword?"text":"password"} required/>
            <button type="button" aria-label={showPassword?"비밀번호 숨기기":"비밀번호 보기"} onClick={()=>setShowPassword(value=>!value)}>
              {showPassword?<EyeOff size={21} aria-hidden="true"/>:<Eye size={21} aria-hidden="true"/>}
            </button></div></div>
        <button disabled={busy} className="gardenSubmit">{busy?"로그인 중…":"로그인"}</button>
        <p className="gardenHint">모아보자 아이디로 로그인해 주세요.</p>
        {error&&<p role="alert" className="error">{error}</p>}
      </form>}
    </section>
  </article></main>;
}
