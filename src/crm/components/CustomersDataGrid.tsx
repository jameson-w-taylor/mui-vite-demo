import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { DataGrid, GridColDef, GridRowParams, GridToolbar, GridSortModel } from '@mui/x-data-grid';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { usersApi, User } from '../services/usersApi';

interface CustomersDataGridProps {
  onEditUser: (user: User) => void;
  onAddUser: () => void;
}

export default function CustomersDataGrid({ onEditUser, onAddUser }: CustomersDataGridProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const sortBy = sortModel.length > 0 
        ? `${sortModel[0].field === 'fullName' ? 'name.first' : sortModel[0].field}`
        : 'name.first';
      
      const response = await usersApi.getUsers({
        page: page + 1,
        perPage: pageSize,
        search: search.trim() || undefined,
        sortBy,
      });
      
      setUsers(response.data);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, sortModel]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (user: User) => {
    if (window.confirm(`Are you sure you want to delete ${user.name.first} ${user.name.last}?`)) {
      try {
        await usersApi.deleteUser(user.login.uuid);
        await fetchUsers(); // Refresh the data
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete user');
      }
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(0); // Reset to first page when searching
    fetchUsers();
  };

  const columns: GridColDef[] = [
    {
      field: 'picture',
      headerName: 'Avatar',
      width: 80,
      sortable: false,
      renderCell: (params) => {
        if (!params?.row?.picture?.thumbnail || !params?.row?.name) {
          return (
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: 'grey.300',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                color: 'white',
              }}
            >
              ?
            </Box>
          );
        }
        return (
          <Box
            component="img"
            src={params.row.picture.thumbnail}
            alt={`${params.row.name.first} ${params.row.name.last}`}
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
        );
      },
    },
    {
      field: 'fullName',
      headerName: 'Full Name',
      width: 200,
      valueGetter: (params) => {
        if (!params?.row?.name) return '';
        return `${params.row.name.first} ${params.row.name.last}`;
      },
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 250,
    },
    {
      field: 'location',
      headerName: 'Location',
      width: 200,
      valueGetter: (params) => {
        if (!params?.row?.location) return '';
        return `${params.row.location.city}, ${params.row.location.country}`;
      },
    },
    {
      field: 'phone',
      headerName: 'Phone',
      width: 150,
    },
    {
      field: 'age',
      headerName: 'Age',
      width: 80,
      valueGetter: (params) => {
        if (!params?.row?.dob) return '';
        return params.row.dob.age;
      },
    },
    {
      field: 'registered',
      headerName: 'Member Since',
      width: 120,
      valueGetter: (params) => {
        if (!params?.row?.registered?.date) return '';
        return new Date(params.row.registered.date).getFullYear();
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Edit User">
            <IconButton
              size="small"
              onClick={() => onEditUser(params.row)}
              color="primary"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete User">
            <IconButton
              size="small"
              onClick={() => handleDelete(params.row)}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Button onClick={fetchUsers} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
        <Box component="form" onSubmit={handleSearchSubmit} sx={{ flex: 1 }}>
          <TextField
            fullWidth
            label="Search customers"
            placeholder="Search by name, email, or city..."
            value={search}
            onChange={handleSearchChange}
            variant="outlined"
            size="small"
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddUser}
          size="small"
        >
          Add Customer
        </Button>
      </Stack>

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={users}
          columns={columns}
          getRowId={(row) => row.login.uuid}
          loading={loading}
          pagination
          paginationMode="server"
          page={page}
          pageSize={pageSize}
          rowCount={total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 25, 50, 100]}
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          disableRowSelectionOnClick
          slots={{
            toolbar: GridToolbar,
            loadingOverlay: () => (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                }}
              >
                <CircularProgress />
              </Box>
            ),
          }}
          slotProps={{
            toolbar: {
              showQuickFilter: false,
            },
          }}
          sx={{
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        />
      </Box>
    </Box>
  );
}
