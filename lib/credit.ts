export type CreditProfile = {
 simulation:true;score:number;as_of:string;inquiries:number;
 balance:string;credit_limit:string;available_credit:string;utilization:number|null;
 payments_total:number;payments_on_time:number;late_payments:number;on_time_percentage:number|null;
 accounts:{id:number;name:string;balance:string;credit_limit:string;available_credit:string;utilization:number|null;payments_total:number;payments_on_time:number;late_payments:number;opened_on:string}[];
};
