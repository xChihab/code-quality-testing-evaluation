export interface User {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

export interface ApiError {
  response?: { data?: { error?: string } };
}
