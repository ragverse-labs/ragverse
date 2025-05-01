"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { resetPassword } from "@/lib/slices/authSlice";
import { useForm } from "react-hook-form";
import Brand from "../auth/brand";

const schema = {
  password: { required: true, minLength: 8, maxLength: 64 },
  confirmation: { required: true },
};

const redirectRoute = "/";

const renderError = (type: string) => {
  return (
    <p className="text-teal-400 text-sm mt-1">
      {type === "required" && "This field is required."}
      {(type === "minLength" || type === "maxLength") &&
        "Password must be 8–64 characters long."}
      {type === "match" && "Passwords do not match."}
    </p>
  );
};

function UnsuspendedResetPassword() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const query = useSearchParams();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  async function submit(values: any) {
    const tk = query.get("token") as string;
    await dispatch(resetPassword(values.password, tk));

    await new Promise((resolve) => setTimeout(resolve, 2000));
    router.push(redirectRoute);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="flex flex-col items-center p-8 rounded-lg shadow-lg bg-gray-800 max-w-md w-full">
      <Brand size="small"/>

        <h1 className="text-3xl font-bold text-gray-100 mt-6">Reset Password</h1>

        <form onSubmit={handleSubmit(submit)} className="w-full mt-6 space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm text-gray-300">
              New Password
            </label>
            <input
              {...register("password", schema.password)}
              type="password"
              id="password"
              className="w-full mt-1 px-3 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
           {errors.password?.type && renderError(errors.password.type as string)}

          </div>

          <div>
            <label htmlFor="confirmation" className="block text-sm text-gray-300">
              Confirm Password
            </label>
            <input
              {...register("confirmation", {
                ...schema.confirmation,
                validate: {
                  match: (val: string) => watch("password") === val,
                },
              })}
              type="password"
              id="confirmation"
              className="w-full mt-1 px-3 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
           {errors.password?.type && renderError(errors.password.type as string)}

          </div>

          <button
            type="submit"
            className="w-full mt-4 px-4 py-2 bg-teal-600 text-white font-semibold rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-400"
          >
            Submit
          </button>
        </form>
      </div>
    </main>
  );
}

export default function ResetPassword() {
  return <Suspense><UnsuspendedResetPassword /></Suspense>;
}


