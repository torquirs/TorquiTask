'use client'

import { useRouter } from 'next/navigation'
import { Controller, useForm } from "react-hook-form"
import React from 'react'
import { SignInFormData, signInschema } from '@/lib/validations/auth';
import { zodResolver } from "@hookform/resolvers/zod"
import { Field, FieldError, FieldLabel } from '../ui/field';
import { Input } from '@base-ui/react';
import { Button } from '../ui/button';
import  Link from 'next/link'; 
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

const SignInForm = () => {
    const router = useRouter();

    const form = useForm<SignInFormData>({
        resolver: zodResolver(signInschema),
        defaultValues: {
            email:"", password:""
        }
    });

    const submitting = form.formState.isSubmitting;

    const handleSubmit = async (data: SignInFormData) => {
        await authClient.signIn.email(data, {
            onSuccess: () => {
                router.push("/dashboard")
            },
            onError: (error) => {
                toast.error(error.error.message || 
                "An error occurred while signing in.");
            }
        });
    };

  return  <div>
    <div className="mb-6">
        <h1 className="text-foreground">
            Welcome to TorquiTask
        </h1>
    </div>
        <form 
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-4"
        >
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
                <Button
                    type="submit"
                    disabled={submitting}
                >
                    {submitting ? "signin in ..." : "Sign In"}
                </Button>
        </form>

        <div className="mt-4 text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link 
            href="/sign-up"
            className="font-medium text-primary hover:underline"
                        >
                Sign up
            </Link>
        </div>
    </div>
  
}

export default SignInForm