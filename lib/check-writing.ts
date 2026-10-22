const small = ["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"];
const tens = ["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];
function wholeWords(n:number):string {
 if(n<20)return small[n];
 if(n<100)return tens[Math.floor(n/10)]+(n%10?`-${small[n%10]}`:"");
 if(n<1000)return `${small[Math.floor(n/100)]} hundred`+(n%100?` ${wholeWords(n%100)}`:"");
 return `${wholeWords(Math.floor(n/1000))} thousand`+(n%1000?` ${wholeWords(n%1000)}`:"");
}
export function checkCents(amount:string):number|null {
 if(!/^\d{1,6}(?:\.\d{1,2})?$/.test(amount.trim()))return null;
 const [dollars,cents=""]=amount.trim().split(".");
 const result=Number(dollars)*100+Number(cents.padEnd(2,"0"));
 return result>0?result:null;
}
export function checkAmountWords(amount:string):string|null {
 const cents=checkCents(amount);if(cents===null)return null;
 const words=wholeWords(Math.floor(cents/100));
 return `${words[0].toUpperCase()+words.slice(1)} and ${String(cents%100).padStart(2,"0")}/100 dollars`;
}
export function matchingCheckWords(amount:string,written:string):boolean {
 const expected=checkAmountWords(amount);if(!expected)return false;
 const normalize=(text:string)=>text.toLowerCase().replace(/\b(?:dollars|and)\b/g,"").replace(/[^a-z0-9/]/g,"");
 return normalize(expected)===normalize(written);
}
