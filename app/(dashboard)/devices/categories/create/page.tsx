import { DashboardHeader } from "@/components/dashboard-header";
import { DeviceCategoryCreateForm } from "@/components/device-category-create-form";

function DeviceCategoryCreatePage() {
    return (
        <div className="flex flex-col gap-6">
            <DashboardHeader
                title="Tambah Kategori Perangkat"
                backTo="/devices/categories"
            />

            <DeviceCategoryCreateForm />
        </div>
    );
}

export default DeviceCategoryCreatePage;
