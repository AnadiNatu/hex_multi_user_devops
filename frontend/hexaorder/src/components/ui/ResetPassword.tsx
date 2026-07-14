import { useState } from 'react';
import toast from 'react-hot-toast';

import AdminCard from './AdminCard';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

import { passwordService } from '@/services/passwordService';

export default function ResetPasswordCard(){

const[identifier,setIdentifier]=useState("");

const[otp,setOtp]=useState("");

const[newPassword,setNewPassword]=useState("");

const[loading,setLoading]=useState(false);

async function submit(){

try{

setLoading(true);

const res=await passwordService.resetPassword({

identifier,

otp,

newPassword

});

toast.success(

res.message ||

"Password reset successfully."

);

}

catch(e:any){

toast.error(

e?.response?.data?.message ||

"Password reset failed."

);

}

finally{

setLoading(false);

}

}

return(

<AdminCard>

<h3 className="text-xl font-bold text-white">

Reset Password

</h3>

<p className="text-slate-400 mt-2 mb-5">

Verify OTP and create a new password.

</p>

<div className="space-y-4">

<Input

label="Identifier"

value={identifier}

onChange={(e)=>setIdentifier(e.target.value)}

/>

<Input

label="OTP"

value={otp}

onChange={(e)=>setOtp(e.target.value)}

/>

<Input

type="password"

label="New Password"

value={newPassword}

onChange={(e)=>setNewPassword(e.target.value)}

/>

<Button

className="w-full"

isLoading={loading}

onClick={submit}

>

Reset Password

</Button>

</div>

</AdminCard>

);

}