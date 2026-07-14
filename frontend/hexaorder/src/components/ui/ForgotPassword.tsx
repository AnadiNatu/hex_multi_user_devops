import { useState } from 'react';
import toast from 'react-hot-toast';

import AdminCard from './AdminCard';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

import { passwordService } from '@/services/passwordService';

export default function ForgotPasswordCard() {

    const [email,setEmail]=useState("");

    const [method,setMethod]=useState<"EMAIL"|"SMS">("EMAIL");

    const [loading,setLoading]=useState(false);

    async function submit(){

        if(!email.trim()){

            toast.error("Email is required");

            return;
        }

        try{

            setLoading(true);

            const res=await passwordService.forgotPassword({

                email,

                method

            });

            toast.success(

                res.message ||

                "Recovery OTP sent."

            );

        }

        catch(e:any){

            toast.error(

                e?.response?.data?.message ||

                "Unable to send recovery OTP."

            );

        }

        finally{

            setLoading(false);

        }

    }

    return(

<AdminCard>

<h3 className="text-xl font-bold text-white">

Forgot Password

</h3>

<p className="text-slate-400 mt-2 mb-5">

Send a password recovery OTP.

</p>

<div className="space-y-4">

<Input

label="Email"

value={email}

onChange={(e)=>setEmail(e.target.value)}

placeholder="example@gmail.com"

/>

<div>

<label className="text-xs font-bold uppercase text-slate-500">

Delivery Method

</label>

<select

className="w-full mt-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"

value={method}

onChange={(e)=>setMethod(e.target.value as any)}

>

<option value="EMAIL">

EMAIL

</option>

<option value="SMS">

SMS

</option>

</select>

</div>

<Button

className="w-full"

isLoading={loading}

onClick={submit}

>

Send OTP

</Button>

</div>

</AdminCard>

    );

}