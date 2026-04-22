
import UsersTable from "@/features/tickets/components/UsersTable";




export default function UserList() {
  
  return (
    // 1. Contenedor con scroll horizontal para dispositivos móviles
    <div className="max-w-xl mx-auto">
    <div className="mt-20 mx-5 overflow-x-auto border border-black rounded-xl shadow-sm bg-white">
      <UsersTable></UsersTable>
    </div>
    </div>
  );
}