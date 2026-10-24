export const demoStudents = [
 {id:"jordan",name:"Jordan",score:720,balance:10000},
 {id:"avery",name:"Avery",score:685,balance:7500},
 {id:"casey",name:"Casey",score:760,balance:12000}
];
export type DemoWork={balance:number;activity:{id:number;label:string;cents:number}[];draft:string;submittedText:string;submitted:boolean;grade:number|null;feedback:string;messages:{author:string;text:string}[]};
export type DemoState=Record<string,DemoWork>;
export function initialDemo():DemoState{return Object.fromEntries(demoStudents.map(s=>[s.id,{balance:s.balance,activity:[{id:0,label:"Classroom opening grant",cents:s.balance}],draft:"",submittedText:"",submitted:false,grade:null,feedback:"",messages:[{author:"Ms. Rivera",text:"Welcome! Let’s make a plan for your $100 weekly budget."}]}]));}
export type DemoAction={type:"money";student:string;cents:number;label:string}|{type:"draft";student:string;text:string}|{type:"submit";student:string}|{type:"grade";student:string;points:number;feedback:string}|{type:"message";student:string;author:string;text:string}|{type:"reset"};
export function demoReducer(state:DemoState,action:DemoAction):DemoState{
 if(action.type==="reset")return initialDemo();
 const work=state[action.student];if(!work)return state;
 let next=work;
 if(action.type==="money"){
  if(!Number.isSafeInteger(action.cents)||action.cents===0||work.balance+action.cents<0)return state;
  next={...work,balance:work.balance+action.cents,activity:[{id:work.activity.length,label:action.label,cents:action.cents},...work.activity]};
 }
 if(action.type==="draft")next={...work,draft:action.text};
 if(action.type==="submit"&&work.draft.trim())next={...work,submittedText:work.draft.trim(),submitted:true,grade:null,feedback:""};
 if(action.type==="grade"&&work.submitted&&Number.isInteger(action.points)&&action.points>=0&&action.points<=100)next={...work,grade:action.points,feedback:action.feedback};
 if(action.type==="message"&&action.text.trim())next={...work,messages:[...work.messages,{author:action.author,text:action.text.trim()}]};
 return next===work?state:{...state,[action.student]:next};
}
