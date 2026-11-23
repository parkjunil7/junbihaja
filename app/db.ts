import {createClient} from "@supabase/supabase-js";
import {blank, type Band, type Details, type ReviewField} from "./model";

export const db=createClient("https://gqttecguoftuwjanunry.supabase.co","sb_publishable__jUouUzu2s-Jz90sPUP-sA_fgTynadc",{auth:{storageKey:"junbihaja-session"}});
const columns="id, details, version, has_photo";
type RecordRow={id:string,details:Details,version:number,has_photo:boolean};
function unpack(b:RecordRow):Band {return {...blank,...b.details,id:b.id,version:b.version,hasPhoto:b.has_photo};}
export async function listCandidates():Promise<Band[]> {
  const rows:Band[]=[];
  for(let start=0;;start+=250){
    const {data,error}=await db.from("wedding_candidates").select(columns).order("created_at",{ascending:false}).order("id").range(start,start+249);
    if(error)throw error;
    rows.push(...data.map(unpack));
    if(data.length<250)return rows;
  }
}
export async function saveCandidate(id:string,version:number,details:Details,photo:Blob|null,remove:boolean) {
  const changes:{details:Details,version:number,photo?:string|null}={details,version:version+1};
  if(photo){
    changes.photo=await new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=()=>reject(Error("사진을 읽지 못했어요."));r.readAsDataURL(photo);});
    if(changes.photo.length>3000000)throw Error("사진이 커요. 더 작은 사진을 선택해 주세요.");
  }else if(remove)changes.photo=null;
  const table=db.from("wedding_candidates");
  const query=version?table.update(changes).eq("id",id).eq("version",version):table.insert({id,...changes});
  const {data,error}=await query.select(columns).maybeSingle();
  if(error?.code==="23505"||(!error&&!data))throw Error("다른 창에서 먼저 저장했어요. 닫고 새로고침해 주세요.");
  if(error||!data)throw Error("저장하지 못했어요. 연결과 로그인 상태를 확인해 주세요.");
  return unpack(data);
}
export async function memberReviewField(memberId:string):Promise<ReviewField> {
  const {data,error}=await db.from("members").select("slot").eq("user_id",memberId).single();
  if(error)throw error;
  if(data.slot===1)return "review1";
  if(data.slot===2)return "review2";
  throw Error("후기 작성자 정보를 확인하지 못했어요.");
}
