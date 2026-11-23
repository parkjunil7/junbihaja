import {useState,useEffect} from "react";
import {db} from "./db";
import type {Band} from "./model";
export function usePhoto(row:Band|null) {
  const id=row?.hasPhoto?row.id:"",version=row?.version;
  const [image,setImage]=useState({key:"",src:""});
  const key=id+":"+version;
  useEffect(()=>{if(!id)return;let active=true;
    void db.from("wedding_candidates").select("photo").eq("id",id).maybeSingle()
      .then(({data})=>{if(active)setImage({key,src:data?.photo??""});});
    return ()=>{active=false;};
  },[id,key]);
  return image.key===key?image.src:"";
}
export function CandidatePhoto({row,alt}:{row:Band,alt:string}) {
  const src=usePhoto(row);
  return src?<img src={src} alt={alt}/>:<span className="noPhoto">사진 불러오는 중</span>;
}
