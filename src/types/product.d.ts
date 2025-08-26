export interface Product {
  id: string;
  name: string;
  data: {
    color: string;
    "capacity GB": number;
  };
}
