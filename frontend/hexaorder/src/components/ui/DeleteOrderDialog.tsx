import ConfirmationDialog from "@/components/ui/ConfirmationDialog";

interface Props {

    open:boolean;

    loading:boolean;

    onCancel:()=>void;

    onConfirm:()=>void;

}

export default function DeleteOrderDialog({

    open,

    loading,

    onCancel,

    onConfirm,

}:Props){

    return(

        <ConfirmationDialog

            open={open}

            title="Delete Order"

            description="This operation permanently removes the order and cannot be undone."

            confirmText="Delete"

            confirmVariant="danger"

            loading={loading}

            onCancel={onCancel}

            onConfirm={onConfirm}

        />

    );

}