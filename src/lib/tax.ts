export function pitTax(a:number){
  const b=[{u:150000,r:0},{u:300000,r:.05},{u:500000,r:.10},{u:750000,r:.15},{u:1000000,r:.20},{u:2000000,r:.25},{u:5000000,r:.30},{u:Infinity,r:.35}];
  let t=0,p=0; for(const x of b){ const v=Math.max(0,Math.min(a,x.u)-p); t+=v*x.r; p=x.u; if(a<=x.u) break } return Math.max(0,Math.floor(t));
}
export function marginalRate(a:number){ if(a<=150000)return 0; if(a<=300000)return .05; if(a<=500000)return .10; if(a<=750000)return .15; if(a<=1000000)return .20; if(a<=2000000)return .25; if(a<=5000000)return .30; return .35 }
export function grossUp(net:number,rate:number){ if(rate<=0)return 0; return net*rate/(1-rate) }
export function pitTaxExact(a:number){
  const b=[{u:150000,r:0},{u:300000,r:.05},{u:500000,r:.10},{u:750000,r:.15},{u:1000000,r:.20},{u:2000000,r:.25},{u:5000000,r:.30},{u:Infinity,r:.35}];
  let t=0,p=0; for(const x of b){ const v=Math.max(0,Math.min(a,x.u)-p); t+=v*x.r; p=x.u; if(a<=x.u) break } return Math.max(0,t);
}
/** Progressive gross-up solving PIT(base+prem+g - ded) - PIT(base - ded) = g */
export function progressiveGrossUp(base:number, prem:number, deductions:number=260000){
  let g=0;
  for(let i=0;i<60;i++){ const before=pitTaxExact(Math.max(0,base-deductions)); const after=pitTaxExact(Math.max(0,base+prem+g-deductions)); const ng=after-before; if(Math.abs(ng-g)<1e-6) break; g=ng }
  return g;
}