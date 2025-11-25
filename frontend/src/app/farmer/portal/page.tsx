import ProtectedContent from '../../../components/auth/ProtectedContent';
import FarmerPortalPanel from '../../../components/farmer/FarmerPortalPanel';

export default function FarmerPortalPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <ProtectedContent allowedRoles={['farmer']}>
        <FarmerPortalPanel />
      </ProtectedContent>
    </div>
  );
}







