export const ringCategory = "웨딩밴드";

// The three stored keys also carry the original ring design, delivery and resizing notes.
type Profile = {material:string, delivery:string, care:string, criteria:string[]};
const profiles = new Map<string, Profile>(
  ([
    ["예식장", "홀·예식 방식", "가능 날짜·시간", "위치·교통", ["보증 인원", "1인 식대", "대관료", "주차"]],
    ["스튜디오", "촬영 스타일", "촬영·납품 일정", "보정·원본 제공", ["촬영 시간", "촬영 콘셉트 수"]],
    ["드레스", "드레스 스타일", "피팅·대여 일정", "피팅·변경 조건", ["피팅비", "헬퍼비"]],
    ["헤어·메이크업", "스타일·담당자", "시작 시간·소요 시간", "출장·얼리스타트", ["리허설 포함 여부"]],
    [ringCategory, "소재·디자인", "수령 예정", "사이즈 조정", []],
    ["스드메 패키지", "제휴 업체", "촬영·피팅 일정", "업체 변경 조건", ["드레스 추가금", "원본·보정 비용"]],
    ["본식 촬영·영상", "촬영 스타일", "촬영·납품 일정", "촬영 인원", ["원본·편집본", "촬영 범위"]],
    ["예복·한복", "소재·디자인", "가봉·수령 일정", "대여·맞춤 조건", ["수선 비용"]],
    ["부케·꽃장식", "꽃·색감", "배송·설치 일정", "구성·회수 조건", ["계절 꽃 대체 여부"]],
    ["청첩장", "디자인·형식", "제작·배송 일정", "최소 주문 수량", ["수량별 단가", "시안 수정"]],
    ["답례품", "상품·포장 구성", "수령 예정", "최소 주문 수량", ["개당 단가"]],
    ["신혼여행", "지역·숙소", "여행 일정", "예약·취소 조건", ["교통편", "포함 식사"]],
    ["혼수·가전", "제품·모델", "배송·설치 일정", "보증·사후 관리", ["설치비"]],
  ] as [string,string,string,string,string[]][]).map(([name,material,delivery,care,criteria])=>[name,{material,delivery,care,criteria}])
);
export const categoryNames = [...profiles.keys()];
export function categoryProfile(name:string):Profile {
  return profiles.get(name) ?? {material:"구성·특징", delivery:"가능 일정", care:"계약·이용 조건", criteria:[]};
}
export function stageNames(name:string) {
  return ["관심 있음", name===ringCategory?"착용해 봄":"검토 중", "최종 후보", "제외"];
}
export type Criterion = {label:string,value:string};
export function readCriteria(raw:string):Criterion[] {
  const entries:unknown=JSON.parse(raw);
  if(!Array.isArray(entries) || entries.length>50) throw Error("비교 기준은 50개까지 추가할 수 있어요.");
  const seen=new Set<string>();
  return entries.map(entry=>{
    if(!entry || typeof entry.label!=="string" || typeof entry.value!=="string")throw Error("비교 기준을 확인해 주세요.");
    const label=entry.label.trim(),value=entry.value.trim();
    if(!label || label.length>80 || value.length>2000 || seen.has(label))throw Error("비교 기준의 이름과 중복 여부를 확인해 주세요.");
    seen.add(label);
    return {label,value};
  });
}
