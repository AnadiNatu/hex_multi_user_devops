import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";

interface Props {

  value: string;

  onChange: (value: string) => void;

}

export default function CustomerFilter({

  value,

  onChange,

}: Props) {

  return (

    <div className="w-full md:w-80">

      <Input

        placeholder="Search customer email..."

        value={value}

        onChange={(e) => onChange(e.target.value)}

        leftIcon={<Search className="w-4 h-4" />}

      />

    </div>

  );

}