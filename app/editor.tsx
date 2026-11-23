import {saveCandidate} from "./db";
import {usePhoto} from "./photo";
"use client";
import {useEffect,useRef,useState} from "react";
import {Camera, X} from "lucide-react";
import {blank,validate,reviewLabels,type ReviewField,type Band,type Details} from "./model";
import {categoryProfile,readCriteria,ringCategory,stageNames,type Criterion} from "./categories";

async function shrinkPhoto(file:File) {
  const url=URL.createObjectURL(file);
  try {
    const img=new Image(); img.src=url; await img.decode();
    const ratio=Math.min(1,1200/Math.max(img.width,img.height));
    const canvas=document.createElement("canvas");
    canvas.width=Math.max(1,Math.round(img.width*ratio)); canvas.height=Math.max(1,Math.round(img.height*ratio));
    const ctx=canvas.getContext("2d")!;
    ctx.fillStyle="#fff"; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.drawImage(img,0,0,canvas.width,canvas.height);
    return await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error()),"image/jpeg",0.78));
  } finally {URL.revokeObjectURL(url);}
}

export default function Editor({reviewField,row,initialCategory,categories,peers,close,saved}:{reviewField:ReviewField|null,row:Band|null,initialCategory:string,categories:string[],peers:Band[],close:()=>void,saved:(b:Band)=>void}) {
  const dialog=useRef<HTMLDialogElement>(null);
  const [id]=useState(()=>row?.id??crypto.randomUUID());
  const [draft,setDraft]=useState<Details>(row??{...blank,category:initialCategory});
  const [custom,setCustom]=useState(false);
  const [attributes,setAttributes]=useState<Criterion[]>(row?readCriteria(row.criteria):[]);
  const partnerField=reviewField==="review1"?"review2":"review1";
  const profile=categoryProfile(draft.category);
  const ring=draft.category===ringCategory;
  const suggested=[...new Set([...profile.criteria,...peers.filter(b=>b.category===draft.category).flatMap(b=>readCriteria(b.criteria).map(c=>c.label))])];
  function setAttribute(label:string,value:string) {
    setAttributes(items=>[...items.filter(c=>c.label!==label),{label,value}]);
  }
  const [extraLabels,setExtraLabels]=useState<string[]>([]);
  function chooseCategory(category:string) {
    setCustom(!category);setExtraLabels([]);setAttributes([]);
    setDraft(d=>({...d,category,stage:stageNames(category).includes(d.stage)?d.stage:"관심 있음"}));
  }
  const [photo,setPhoto]=useState<Blob|null>(null),[removed,setRemoved]=useState(false),[source,setSource]=useState("");
  const [saving,setSaving]=useState(false),[reading,setReading]=useState(false),[error,setError]=useState("");
  useEffect(()=>{dialog.current?.showModal();},[]);
  useEffect(()=>{if(!photo){setSource("");return;}const u=URL.createObjectURL(photo);setSource(u);return()=>URL.revokeObjectURL(u);},[photo]);
  const existing=usePhoto(row);
  const preview=source||(!removed?existing:"");
  function update(key:keyof Details,value:string){setDraft(d=>({...d,[key]:value}));}
  function input(key:keyof Details,label:string,hint="",type="text") {
    return <label>{label}<input type={type} value={draft[key]} maxLength={2000} placeholder={hint} onChange={e=>update(key,e.target.value)}/></label>;
  }
  async function save(e:React.FormEvent) {
    e.preventDefault(); if(saving||reading)return;
    const fields={...blank};
    for(const k of Object.keys(blank) as (keyof Details)[]) fields[k]=draft[k].trim();
    for(const key of ["review1","review2"] as const)if(key!==reviewField)fields[key]=row?.[key]??"";
    fields.criteria=JSON.stringify(attributes.filter(c=>c.value.trim() || extraLabels.includes(c.label)));
    const issue=validate(fields,!!photo||!!(row?.hasPhoto&&!removed));
    if(issue){setError(issue);return;}
    setSaving(true);setError("");
    try {
      saved(await saveCandidate(id,row?.version??0,fields,photo,removed));
    }catch(e){setError(e instanceof Error?e.message:"연결을 확인하고 다시 저장해 주세요.");setSaving(false);}
  }
  return <dialog ref={dialog} aria-labelledby="editor-title" onCancel={e=>{e.preventDefault();if(!saving)close();}}>
    <form onSubmit={save}><div className="dialog-head"><h2 id="editor-title">{row?"후보 기록":"후보 추가"}</h2><button type="button" className="icon" disabled={saving} onClick={close} aria-label="닫기"><X/></button></div>
    <p className="hint">준비 항목을 고르고 사진이나 링크로 후보를 담아보세요.</p>
    <label>준비 항목<select required disabled={!!row} value={custom?"new":draft.category?"category-"+draft.category:""} onChange={e=>chooseCategory(e.target.value==="new"?"":e.target.value.slice(9))}>
      <option disabled value="">항목 선택</option>
      {categories.map(name=><option key={name} value={"category-"+name}>{name}</option>)}<option value="new">＋ 새 준비 항목 직접 입력</option>
    </select></label>
    {custom&&<label>새 준비 항목 이름<input required maxLength={50} value={draft.category} placeholder="예: 본식 사회자" onChange={e=>update("category",e.target.value)}/></label>}
    <div className="photo-control">{preview&&<img src={preview} alt="저장할 후보 사진"/>}
      <label className="photo-picker"><Camera size={19}/>{reading?"사진 준비 중…":preview?"사진 바꾸기":"후보 사진 추가"}<input type="file" accept="image/*" disabled={reading||saving} onChange={async e=>{const f=e.target.files?.[0];e.target.value="";if(!f)return;setReading(true);try{const b=await shrinkPhoto(f);setPhoto(b);setRemoved(false);setError("");}catch{setError("사진을 읽지 못했어요. JPG나 PNG 파일을 선택해 주세요.");}finally{setReading(false);}}}/></label>
      {preview&&<button type="button" className="linkbtn" onClick={()=>{setRemoved(true);setPhoto(null);}}>사진 지우기</button>}</div>
    {input("name","후보 이름",ring?"브랜드 또는 모델명":"업체명, 장소 또는 상품명")}{input("url","관련 링크","https://","url")}
    <div className="formgrid">{input("store",ring?"매장":"업체·지점")}<label>상태<select value={draft.stage} onChange={e=>update("stage",e.target.value)}>{stageNames(draft.category).map(s=><option key={s}>{s}</option>)}</select></label></div>
    {input("visitDate","방문 예정일 (선택)","","date")}
    <details open={row?true:undefined}><summary>{ring?"착용 후기와 상담 기록":"견적·비교 기준·두 사람의 의견"}</summary>
      {input("material",profile.material)}
      {reviewField?<div className="formgrid">
        <label>{reviewLabels[reviewField]}<textarea value={draft[reviewField]} maxLength={2000} placeholder="마음에 든 점과 고민되는 점" onChange={e=>update(reviewField,e.target.value)}/></label>
        <div className="partnerReview"><strong>{reviewLabels[partnerField]}</strong><p>{draft[partnerField]||"아직 작성한 후기가 없어요."}</p></div>
      </div>:<p className="hint">후기 작성자 정보를 확인하는 중이에요.</p>}
      <label>{ring?"한 쌍 견적":"예상 견적"} (원)<input inputMode="numeric" pattern="[0-9]{1,10}" maxLength={10} value={draft.price} placeholder="견적 전이라면 비워 두세요" onChange={e=>update("price",e.target.value)}/></label>
      {input("extras","추가금·포함 사항")}
      <div className="formgrid">{input("delivery",profile.delivery)}{input("care",profile.care)}</div>
      <div className="formgrid">{[...new Set([...suggested,...extraLabels,...attributes.map(c=>c.label)])].map(label=><label key={label}>{label}
        <input maxLength={2000} value={attributes.find(c=>c.label===label)?.value??""} onChange={e=>setAttribute(label,e.target.value)}/></label>)}</div>
      <CriterionInput onAdd={label=>{if(suggested.includes(label)||extraLabels.includes(label)||attributes.some(c=>c.label===label))return false;setExtraLabels(a=>[...a,label]);setAttribute(label,"");return true;}}/>
    </details>
    {error&&<p className="error" role="alert">{error}</p>}
    <div className="formfoot"><button type="button" className="soft" disabled={saving} onClick={close}>취소</button><button className="primary" disabled={saving||reading}>{saving?"저장 중…":"후보 저장"}</button></div></form>
  </dialog>;
}

function CriterionInput({onAdd}:{onAdd:(label:string)=>boolean}) {
  const [name,setName]=useState(""),[message,setMessage]=useState("");
  const add=()=>{const label=name.trim();if(!label)return;if(!onAdd(label)){setMessage("이미 있는 기준이에요.");return;}setName("");setMessage("");};
  return <div className="criterion-input"><label>직접 비교할 기준<input value={name} maxLength={80} placeholder="예: 주말 예약 가능 여부" onChange={e=>{setName(e.target.value);setMessage("");}} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();add();}}}/></label>
    <button className="soft" type="button" disabled={!name.trim()} onClick={add}>기준 추가</button>{message&&<small role="status">{message}</small>}</div>;
}
