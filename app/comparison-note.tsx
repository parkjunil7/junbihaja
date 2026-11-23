import {useState} from "react";
import {db} from "./db";
import type {Band} from "./model";
export default function ComparisonNote({chosen}:{chosen:Band[]}){
  const [answer,setAnswer]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState("");
  async function compare(){
    if(busy)return;setBusy(true);setError("");
    try{
      const {data,error}=await db.functions.invoke("wedding-compare",{body:{ids:chosen.map(b=>b.id)}});
      if(error){
        const info=await error.context?.json?.().catch(()=>null);
        throw Error(info?.error??"비교 메모를 만들지 못했어요. 잠시 후 다시 시도해 주세요.");
      }
      setAnswer(data.answer);
    }catch(e){setError(e instanceof Error?e.message:"비교 요청에 실패했어요.");}finally{setBusy(false);}
  }
  return <section className="aiNote"><h2>상담 전 비교 메모</h2><p>선택한 후보의 견적·조건·두 사람의 의견을 GPT로 보내 차이점과 다음 상담 질문을 정리해요.</p>
    <button className="soft" onClick={compare} disabled={busy}>{busy?"정리하는 중…":answer?"다시 정리":"비교 메모 만들기"}</button>{error&&<p role="alert">{error}</p>}{answer&&<p className="aiAnswer" role="status">{answer}</p>}</section>;
}
