import {listCandidates} from "./db";
import {CandidatePhoto} from "./photo";
import {useEffect,useRef,useState} from "react";
import {Plus, Columns2, Check, X, Camera, RefreshCw, LogOut, BookOpen} from "lucide-react";
import Editor from "./editor";
import QuoteTable from "./quote-table";
import {bandName,priceLabel,type Band} from "./model";
import {categoryNames,stageNames} from "./categories";

function DateChip({date}:{date:string}) {
  if(!date)return <span className="dateChip undated"><small>방문일</small><b>미정</b></span>;
  return <time className="dateChip" dateTime={date} aria-label={date}><small>{Number(date.slice(5,7))}월</small><b>{Number(date.slice(8))}</b></time>;
}
export default function Studio({onLogout}:{onLogout:()=>Promise<void>}) {
  const [category,setCategory]=useState(""),[status,setStatus]=useState("전체"),[selected,setSelected]=useState<string[]>([]);
  const [rows,setRows]=useState<Band[]>([]),[view,setView]=useState<"list"|"compare">("list");
  const [edit,setEdit]=useState<Band|null|undefined>(),[pending,setPending]=useState(true),[failed,setFailed]=useState(false),[notice,setNotice]=useState("");
  const sequence=useRef(0);
  async function load(){
    const serial=++sequence.current;
    try{
      const data=await listCandidates();
      if(serial===sequence.current){setRows(data);setSelected(ids=>ids.filter(id=>data.some(b=>b.id===id)));setFailed(false);}
    }catch{if(serial===sequence.current)setFailed(true);}finally{if(serial===sequence.current)setPending(false);}
  }
  useEffect(()=>{void load();window.addEventListener("focus",load);return()=>{sequence.current++;window.removeEventListener("focus",load);};},[]);
  useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(""),3500);return()=>clearTimeout(timer);},[notice]);
  function nav(next:"list"|"compare"){setView(next);window.scrollTo(0,0);}
  function selectCategory(name:string){setCategory(name);setStatus("전체");setSelected([]);}
  function toggle(id:string){setSelected(ids=>ids.includes(id)?ids.filter(k=>k!==id):ids.length<3?[...ids,id]:ids);}
  function openDetail(row:Band){
    const same=chosen.filter(b=>b.category===row.category&&b.id!==row.id);
    setSelected([row.id,...same.slice(0,2).map(b=>b.id)]);nav("compare");
  }
  function saved(row:Band){
    ++sequence.current;setPending(false);setFailed(false);
    setRows(list=>list.some(b=>b.id===row.id)?list.map(b=>b.id===row.id?row:b):[row,...list]);
    if(category&&category!==row.category)selectCategory(row.category);
    if(status!=="전체"&&status!==row.stage)setStatus("전체");
    setEdit(undefined);setNotice("후보를 저장했어요.");
  }
  const categories=[...new Set([...categoryNames,...rows.map(b=>b.category)])];
  const categoryRows=category?rows.filter(b=>b.category===category):rows;
  const selectedRows=selected.flatMap(id=>rows.filter(b=>b.id===id));
  const chosen=selectedRows.filter(b=>b.category===selectedRows[0]?.category);
  const stages=category?stageNames(category):["관심 있음","검토 중","착용해 봄","최종 후보","제외"];
  const sorted=categoryRows.filter(b=>status==="전체"||b.stage===status).sort((a,b)=>(a.visitDate||"9999-99-99").localeCompare(b.visitDate||"9999-99-99"));
  const today=new Intl.DateTimeFormat("sv-SE",{timeZone:"Asia/Seoul"}).format(new Date());
  const groups=[{name:"예정된 방문",items:sorted.filter(b=>b.visitDate&&b.visitDate>=today)},{name:"일정 미정",items:sorted.filter(b=>!b.visitDate)},{name:"지난 방문",items:sorted.filter(b=>b.visitDate&&b.visitDate<today).reverse()}];
  const upcoming=rows.filter(b=>b.visitDate&&b.visitDate>=today).sort((a,b)=>a.visitDate.localeCompare(b.visitDate))[0];
  return <><header className="top"><div className="bar"><a className="brand" href="./" aria-label="준비하자 홈">준비하자</a><nav aria-label="웨딩 준비 메뉴">
    <button aria-current={view==="list"?"page":undefined} onClick={()=>nav("list")}><BookOpen size={17}/>웨딩 투어</button>
    <button aria-current={view==="compare"?"page":undefined} onClick={()=>nav("compare")}><Columns2 size={17}/>대조표</button>
    <button aria-label="로그아웃" title="로그아웃" onClick={()=>onLogout().catch(()=>setNotice("로그아웃하지 못했어요. 다시 시도해 주세요."))}><LogOut size={17}/></button>
  </nav></div></header><main className="wrap">
  {view==="list"?<div className="tourGrid"><aside className="tourSide"><section className="tourCover"><h1>웨딩 투어</h1><img src="./garden-notebook.webp" width="900" height="600" alt="데이지 정원에서 웨딩 노트를 펼쳐 보는 두 고양이"/></section>
    <section className="nextVisit"><h2>다음 방문</h2>{upcoming?<button onClick={()=>openDetail(upcoming)}><DateChip date={upcoming.visitDate}/><span>{bandName(upcoming)}</span></button>:<p>아직 정해진 방문일이 없어요.</p>}</section></aside>
  <section className="tourStops"><div className="sectionhead"><h2>방문할 후보 <span>{categoryRows.length}</span></h2><button className="primary" onClick={()=>setEdit(null)}><Plus size={17}/>후보 추가</button></div>
  <div className="tourFilters"><label>준비 항목<select value={category} onChange={e=>selectCategory(e.target.value)}><option value="">모든 준비 항목</option>{categories.map(c=><option key={c}>{c}</option>)}</select></label>
  <label>후보 상태<select value={status} onChange={e=>setStatus(e.target.value)}>{["전체",...stages].map(s=><option key={s}>{s}</option>)}</select></label>
  <button className="icon" aria-label="후보 새로고침" onClick={load}><RefreshCw size={17}/></button></div>
  {pending?<p className="statebox">후보를 불러오는 중이에요.</p>:failed?<div className="statebox" role="alert">후보를 불러오지 못했어요. <button className="linkbtn" onClick={load}>다시 시도</button></div>:sorted.length?groups.filter(g=>g.items.length).map(g=><section className="visitGroup" key={g.name}><h3>{g.name}</h3>{g.items.map(b=><article key={b.id} className="stopTicket">
    <button className="stopBody" onClick={()=>openDetail(b)}><DateChip date={b.visitDate}/><span className="stopText"><small>{b.category} · {b.stage}</small><strong>{bandName(b)}</strong><span>{priceLabel(b.price)}</span></span>
    {b.hasPhoto?<CandidatePhoto row={b} alt={bandName(b)+" 사진"}/>:<span className="stopBlank"><Camera size={19}/></span>}</button>
    <div className="stopControls"><button onClick={()=>setEdit(b)}>기록 수정</button><button aria-pressed={selected.includes(b.id)} disabled={!selected.includes(b.id)&&(chosen.length===3||!!chosen.length&&chosen[0].category!==b.category)} onClick={()=>toggle(b.id)}>{selected.includes(b.id)?<Check size={14}/>:<Plus size={14}/>}비교함{selected.includes(b.id)?"에 담김":"에 담기"}</button></div></article>)}</section>):
    <div className="statebox"><h3>{categoryRows.length?"이 상태의 후보가 없어요":"첫 방문 후보를 담아보세요"}</h3><p>{categoryRows.length?"다른 상태를 골라보세요.":"사진이나 링크만으로 시작하고, 방문일과 견적은 나중에 채워도 돼요."}</p><button className="soft" onClick={()=>categoryRows.length?setStatus("전체"):setEdit(null)}>{categoryRows.length?"전체 상태 보기":"후보 추가"}</button></div>}
  <aside className="compareDock"><div><strong>비교함 · {chosen.length} / 3</strong><p>{chosen.length?chosen.map(b=>bandName(b)).join(" · "):"같은 준비 항목의 후보를 골라주세요."}</p></div>
    {chosen.length>0&&<button className="icon" onClick={()=>setSelected([])} aria-label="비교함 비우기"><X size={15}/></button>}
    <button className="primary" disabled={chosen.length<2} onClick={()=>nav("compare")}>견적 대조표 보기</button></aside></section></div>:
    <QuoteTable chosen={chosen} all={rows} onAdd={toggle} onRemove={toggle} onEdit={setEdit} onBack={()=>nav("list")}/>}
  </main>{edit!==undefined&&<Editor row={edit} initialCategory={category} categories={categories} peers={rows} close={()=>setEdit(undefined)} saved={saved}/>}
  <div className={notice?"toast":"sr"} role="status">{notice}</div></>;
}
