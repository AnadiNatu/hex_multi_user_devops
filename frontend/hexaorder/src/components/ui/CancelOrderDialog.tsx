import ConfirmationDialog from "@/components/ui/ConfirmationDialog";

interface Props {

    open: boolean;

    loading: boolean;

    onCancel: () => void;

    onConfirm: () => void;

}

export default function CancelOrderDialog({

    open,

    loading,

    onCancel,

    onConfirm,

}: Props){

    return(

        <ConfirmationDialog

            open={open}

            title="Cancel Order"

            description="This order will immediately be marked as CANCELLED."

            confirmText="Cancel Order"

            confirmVariant="danger"

            loading={loading}

            onCancel={onCancel}

            onConfirm={onConfirm}

        />

    );

}