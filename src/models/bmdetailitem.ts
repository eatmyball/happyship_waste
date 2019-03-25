/**
 * Created by ZhuChenjie on 2017/3/27.
 */
export class BmDetailItem
{
  create_date : string;
  currency: string;
  desc : string;
  document_type : string;
  flag : string;
  forwarder_name : string;
  forward_by : string;
  necessity : string;
  price : string;
  requestor_name : string;
  req_dep : string;
  single_vendor : string;
  tel : string;
  jspd : [{vendor : string; price : string; currency : string; result : string; reason : string;}];
  msg : [{message : string;}];
}
