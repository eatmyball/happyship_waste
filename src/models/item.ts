/**
 * Created by ZhuChenjie on 2017/3/22.
 */
export class Item
{
  id : string;
  title: string;
  unit : string;
  price: string;
  creator : string;
  contact : string;
  dept : string;
  type : string;
  exclusive : string;
  necessity : string;
  assessment : [{supplier : string; quote : string; result : string; reason : string;}];
}
