import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import CrmCustomersTable from "../components/CrmCustomersTable";
import CrmEditUserModal from "../components/CrmEditUserModal";
import type { User } from "../components/CrmCustomersTable";

export default function Customers() {
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<"edit" | "create">("edit");
  const [refreshKey, setRefreshKey] = React.useState(0);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  const handleUserUpdated = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
            Customer Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your customer database with search, edit, and delete capabilities
          </Typography>
        </Box>

        <CrmCustomersTable
          key={refreshKey}
          onEditUser={handleEditUser}
          onAddUser={handleAddUser}
        />

        <CrmEditUserModal
          open={modalOpen}
          onClose={handleCloseModal}
          user={selectedUser}
          onUserUpdated={handleUserUpdated}
          mode={modalMode}
        />
      </Stack>
    </Box>
  );
}
