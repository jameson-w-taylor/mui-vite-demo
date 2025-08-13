import * as React from "react";
import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CustomersDataGrid from "../components/CustomersDataGrid";
import CustomerModal from "../components/CustomerModal";
import { User } from "../services/usersApi";

export default function Customers() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  const handleModalSuccess = () => {
    setRefreshKey(prev => prev + 1); // Trigger data refresh
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Customers
      </Typography>

      <CustomersDataGrid
        key={refreshKey}
        onEditUser={handleEditUser}
        onAddUser={handleAddUser}
      />

      <CustomerModal
        open={modalOpen}
        onClose={handleModalClose}
        user={selectedUser}
        onSuccess={handleModalSuccess}
      />
    </Box>
  );
}
