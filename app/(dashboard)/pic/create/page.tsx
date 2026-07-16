import { DashboardHeader } from "@/components/dashboard-header";
import { PicCreateForm } from "@/components/pic-create-form";

function PICCreatePage() {
    return (
        <>
            <DashboardHeader title="Tambah PIC Baru" backTo="/pic" />

            <PicCreateForm />
        </>
    );
}

export default PICCreatePage;
