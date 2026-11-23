import {readCriteria,ringCategory,stageNames} from "./categories";
export const blank = {category:ringCategory, criteria:"[]", name:"", store:"", url:"", stage:"관심 있음", visitDate:"", price:"", extras:"", material:"", review1:"", review2:"", delivery:"", care:""};
export type Details = typeof blank;
export type Band = Details & {id:string, version:number, hasPhoto:boolean};
export const priceLabel = (s:string) => s ? Number(s).toLocaleString("ko-KR")+"원" : "견적 전";
export function bandName(row:Details) {
  if (row.name) return row.name;
  if (row.url) return new URL(row.url).hostname;
  return row.store || "사진으로 저장한 후보";
}
export function validate(fields:Details, hasPhoto:boolean) {
  if (!fields.category.trim() || fields.category.length>50) return "준비 항목 이름을 1~50자로 입력해 주세요.";
  if (!fields.name && !fields.store && !fields.url && !hasPhoto) return "후보 이름, 업체, 관련 링크, 사진 중 하나를 추가해 주세요.";
  if (!stageNames(fields.category).includes(fields.stage)) return "후보 상태를 확인해 주세요.";
  if (fields.visitDate) {
    const date = new Date(fields.visitDate+"T00:00:00Z");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fields.visitDate) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0,10)!==fields.visitDate) return "방문 날짜를 확인해 주세요.";
  }
  try { readCriteria(fields.criteria); } catch(e) { return e instanceof SyntaxError ? "비교 기준을 확인해 주세요." : (e as Error).message; }
  if (fields.price && !/^\d{1,10}$/.test(fields.price)) return "견적은 원 단위의 숫자로 입력해 주세요.";
  if (fields.url) {
    try { if (!["http:","https:"].includes(new URL(fields.url).protocol)) throw Error(); }
    catch { return "http 또는 https로 시작하는 링크를 입력해 주세요."; }
  }
  if (Object.entries(fields).some(([key,v])=>key!=="criteria" && v.length>2000)) return "각 입력란은 2,000자 이내로 작성해 주세요.";
  return "";
}
