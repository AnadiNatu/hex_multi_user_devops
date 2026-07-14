import { useState } from 'react';
import toast from 'react-hot-toast';

import AdminCard from './AdminCard';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

import { passwordService } from '@/services/passwordService';

export default function ChangePasswordCard(){

const[currentPassword,setCurrentPassword]=useState("");

const[newPassword,setNewPassword]=useState("");

const[loading,setLoading]=useState(false);

async function submit(){

try{

setLoading(true);

const res=await passwordService.changePassword({

currentPassword,

newPassword

});

toast.success(

res.message ||

"Password changed successfully."

);

}

catch(e:any){

toast.error(

e?.response?.data?.message ||

"Unable to change password."

);

}

finally{

setLoading(false);

}

}

return(

<AdminCard>

<h3 className="text-xl font-bold text-white">

Change Password

</h3>

<p className="text-slate-400 mt-2 mb-5">

Update your current password.

</p>

<div className="space-y-4">

<Input

type="password"

label="Current Password"

value={currentPassword}

onChange={(e)=>setCurrentPassword(e.target.value)}

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

Change Password

</Button>

</div>

</AdminCard>

);

}