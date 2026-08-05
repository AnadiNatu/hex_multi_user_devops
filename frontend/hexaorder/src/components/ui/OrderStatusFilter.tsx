import { Filter } from "lucide-react";

interface Props {

  value: string;

  onChange: (value: string) => void;

}

const STATUS_OPTIONS = [

  { label: "All Orders", value: "" },

  { label: "Pending", value: "PENDING" },

  { label: "Processing", value: "PROCESSING" },

  { label: "Shipped", value: "SHIPPED" },

  { label: "Delivered", value: "DELIVERED" },

  { label: "Completed", value: "COMPLETED" },

  { label: "Cancelled", value: "CANCELLED" },

];

export default function OrderStatusFilter({

  value,

  onChange,

}: Props) {

  return (

    <div className="flex items-center gap-3">

      <Filter className="w-4 h-4 text-slate-400" />

      <select

        value={value}

        onChange={(e) => onChange(e.target.value)}

        className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700
        text-white text-sm focus:outline-none focus:ring-2
        focus:ring-brand-green"

      >

        {STATUS_OPTIONS.map((status) => (

          <option

            key={status.value}

            value={status.value}

          >

            {status.label}

          </option>

        ))}

      </select>

    </div>

  );

}