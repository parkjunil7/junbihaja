import {db} from "./db";

export type Tray = {candidate_ids:string[], revision:number};
const columns = "candidate_ids,revision";

export async function readTray(memberId:string):Promise<Tray> {
  const {data,error}=await db.from("wedding_comparison_trays").select(columns).eq("member_id",memberId).maybeSingle();
  if(error)throw error;
  return data ?? {candidate_ids:[],revision:0};
}

export async function writeTray(memberId:string, current:Tray, ids:string[]):Promise<Tray> {
  const next={candidate_ids:ids,revision:current.revision+1};
  const table=db.from("wedding_comparison_trays");
  const query=current.revision
    ? table.update(next).eq("member_id",memberId).eq("revision",current.revision)
    : table.insert({...next,member_id:memberId});
  const {data,error}=await query.select(columns).maybeSingle();
  if(error?.code==="23505"||(!error&&!data))throw Error("다른 창에서 비교함을 변경했어요. 최신 목록을 확인한 뒤 다시 선택해 주세요.");
  if(error)throw Error("비교함을 저장하지 못했어요. 연결을 확인하고 다시 시도해 주세요.");
  return data!;
}
