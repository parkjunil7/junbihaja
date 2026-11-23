import ComparisonNote from "./comparison-note";
import {CandidatePhoto} from "./photo";
import {Camera, Pencil, X} from "lucide-react";
import {bandName,priceLabel,reviewLabels,type Band} from "./model";
import {categoryProfile,readCriteria,ringCategory} from "./categories";

type Props={saving:boolean,chosen:Band[],all:Band[],onAdd:(id:string)=>void,onRemove:(id:string)=>void,onEdit:(b:Band)=>void,onBack:()=>void};
export default function QuoteTable({saving,chosen,all,onAdd,onRemove,onEdit,onBack}:Props){
  if(!chosen.length)return <section className="statebox"><h1>견적 대조표</h1><p>웨딩 투어에서 후보를 열거나 같은 항목의 후보를 비교함에 담아 주세요.</p><button className="primary" onClick={onBack}>후보 고르기</button></section>;
  const category=chosen[0].category,profile=categoryProfile(category),ring=category===ringCategory;
  const custom=chosen.map(b=>new Map(readCriteria(b.criteria).map(entry=>[entry.label,entry.value])));
  const labels=[...new Set([...profile.criteria,...custom.flatMap(m=>[...m.keys()])])];
  const others=all.filter(b=>b.category===category&&!chosen.some(c=>c.id===b.id));
  const common=(label:string,field:keyof Band,missing="확인 필요")=><tr key={field}><th scope="row">{label}</th>{chosen.map(b=><td key={b.id} className={!b[field]?"missing":""}>{field==="price"?priceLabel(b.price):field==="url"&&b.url?<a className="product" target="_blank" rel="noopener noreferrer" href={b.url}>링크 열기</a>:String(b[field]||missing)}</td>)}</tr>;
  return <section className="quotePage"><button className="backLink" onClick={onBack}>웨딩 투어로 돌아가기</button>
    <header className="quoteHeading"><div><h1>{category} 견적 대조표</h1></div><img src="./garden-notebook.webp" width="900" height="600" alt=""/></header>
    <div className="quoteTools"><strong>비교 후보 {chosen.length} / 3</strong>{chosen.length<3&&others.length>0&&<label>후보 추가<select disabled={saving} value="" onChange={e=>{if(e.target.value)onAdd(e.target.value);}}><option value="">같은 항목에서 고르기</option>{others.map(b=><option value={b.id} key={b.id}>{bandName(b)}</option>)}</select></label>}</div>
    <div className="tablewrap ticketTable" tabIndex={0} aria-label={category+" 후보별 견적 대조표"}><table>
    <thead><tr><th scope="col">상담 항목</th>{chosen.map(b=><th scope="col" key={b.id}><div className="ticketHead">
      {b.hasPhoto?<CandidatePhoto row={b} alt={bandName(b)+" 사진"}/>:<div className="noPhoto"><Camera size={18}/> 사진 없음</div>}
      <strong>{bandName(b)}</strong><div className="ticketActions"><button onClick={()=>onEdit(b)} aria-label={bandName(b)+" 기록 수정"}><Pencil size={14}/>수정</button>
      {chosen.length>1&&<button disabled={saving} onClick={()=>onRemove(b.id)} aria-label={bandName(b)+" 비교에서 빼기"}><X size={14}/>빼기</button>}</div></div></th>)}</tr></thead>
    <tbody>{common(ring?"한 쌍 견적":"예상 견적","price")}{common("추가금·포함 사항","extras")}
    {labels.map(label=><tr key={"custom-"+label}><th scope="row">{label}</th>{chosen.map((b,i)=><td key={b.id} className={custom[i].get(label)?"":"missing"}>{custom[i].get(label)||"확인 필요"}</td>)}</tr>)}
    {common("방문 예정일","visitDate","미정")}{common("상태","stage")}{common(ring?"매장":"업체·지점","store")}{common(profile.material,"material")}
    {common(profile.delivery,"delivery")}{common(profile.care,"care")}{common(reviewLabels.review2,"review2","아직 작성 전")}{common(reviewLabels.review1,"review1","아직 작성 전")}{common("관련 링크","url")}</tbody>
    </table></div>{chosen.length>=2&&<ComparisonNote key={chosen.map(b=>b.id+":"+b.version).join(",")} chosen={chosen}/>}</section>;
}
