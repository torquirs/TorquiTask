'use client'

import { useRouter } from 'next/navigation'
import { Controller, useForm } from "react-hook-form"
import React from 'react'
import { SignInFormData, signInschema, SignUpFormData, SignUpSchema } from '@/lib/validations/auth';
import { zodResolver } from "@hookform/resolvers/zod"
import { Field, FieldError, FieldLabel } from '../ui/field';
import { Input } from "@/components/ui/input"
import { Button } from '../ui/button';
import  Link from 'next/link'; 
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

const SignUpForm = () => {
    const router = useRouter();

    const form = useForm<SignUpFormData>({
        resolver: zodResolver(SignUpSchema),
        defaultValues: {
            email:"", 
            password:"",
            confirmPassword:"",
            name:""
        }
    });

    const submitting = form.formState.isSubmitting;

    const handleSubmit = async (data: SignUpFormData) => {
        await authClient.signUp.email(data, {
            onSuccess: () => {
                toast.success(
                    "Account created successfuly. Please check your email to verify your account."
                )
                router.push("/sign-in")
            },
            onError: (error) => {
                toast.error(error.error.message || 
                "An error occurred while signing up.");
            }
        });
    };

  return  <div>
    <div className="mb-6">
        <h1 className="text-foreground">
            Create an Account in TorquiTask
        </h1>
    </div>
        <form 
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-4"
        >
            <Controller 
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                     <Field >
                            <FieldLabel>Full Name</FieldLabel>
                             <Input
                                {...field}
                                type="text"
                                autoComplete="name"
                                placeholder="eg: John Doe"
                                autoFocus                          
                             />
                                {fieldState.error && (
                                    <FieldError errors={[fieldState.error]}/>
                                )}         
                     </Field>
                )}
            />

            <Controller 
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                     <Field >
                            <FieldLabel>Email</FieldLabel>
                             <Input
                                {...field}
                                type="email"
                                autoComplete="email"
                                placeholder="Enter your email"
                                autoFocus                          
                             />
                                {fieldState.error && (
                                    <FieldError errors={[fieldState.error]}/>
                                )}         
                     </Field>
                )}
            />

             <Controller 
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                     <Field >
                            <FieldLabel>Password</FieldLabel>
                             <Input
                                {...field}
                                type="password"
                                autoComplete="current-password"
                                placeholder="Enter your password"
                                autoFocus                          
                             />
                                {fieldState.error && (
                                    <FieldError errors={[fieldState.error]}/>
                                )}         
                     </Field>
                )}
            />

            <Controller 
                name="confirmPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                     <Field >
                            <FieldLabel>Confirm Password</FieldLabel>
                             <Input
                                {...field}
                                type="password"
                                autoComplete="current-password"
                                placeholder="Enter your password"
                                autoFocus                          
                             />
                                {fieldState.error && (
                                    <FieldError errors={[fieldState.error]}/>
                                )}         
                     </Field>
                )}
            />

                <Button
                    type="submit"
                    disabled={submitting}
                >
                    {submitting ? "signin up ..." : "Sign Up"}
                </Button>
        </form>

        <div className="mt-4 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link 
            href="/sign-in"
            className="font-medium text-primary hover:underline"
                        >
                Sign in
            </Link>
        </div>
    </div>
  
}

export default SignUpForm