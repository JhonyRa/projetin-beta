import type { SignUpServiceModel } from "@/types/services/auth/sign-up-model";
import type { SignInServiceModel } from "@/types/services/auth/sign-in-model";
import { baseApi } from "@/configs/axios";

export interface ApiResponse {
  message: string;
}

export const signUp = async (
  data: SignUpServiceModel
): Promise<ApiResponse> => {
  const response = await baseApi.post(`/sign-up`, data);
  return response.data;
};

export const signIn = async (
  data: SignInServiceModel
): Promise<ApiResponse> => {
  const response = await baseApi.post(`/sign-in`, data);
  return response.data;
};
