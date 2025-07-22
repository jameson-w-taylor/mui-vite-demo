import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import type { User } from "./CrmCustomersTable";

interface CrmEditUserModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onUserUpdated: () => void;
  mode: "edit" | "create";
}

interface UserFormData {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  title: string;
  gender: string;
  phone: string;
  cell: string;
  streetNumber: string;
  streetName: string;
  city: string;
  state: string;
  country: string;
  postcode: string;
}

const initialFormData: UserFormData = {
  email: "",
  username: "",
  firstName: "",
  lastName: "",
  title: "Mr",
  gender: "male",
  phone: "",
  cell: "",
  streetNumber: "",
  streetName: "",
  city: "",
  state: "",
  country: "",
  postcode: "",
};

export default function CrmEditUserModal({
  open,
  onClose,
  user,
  onUserUpdated,
  mode,
}: CrmEditUserModalProps) {
  const [formData, setFormData] = React.useState<UserFormData>(initialFormData);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Populate form when user changes
  React.useEffect(() => {
    if (user && mode === "edit") {
      setFormData({
        email: user.email,
        username: user.login.username,
        firstName: user.name.first,
        lastName: user.name.last,
        title: user.name.title,
        gender: user.gender,
        phone: user.phone,
        cell: user.cell,
        streetNumber: user.location.street.number.toString(),
        streetName: user.location.street.name,
        city: user.location.city,
        state: user.location.state,
        country: user.location.country,
        postcode: user.location.postcode,
      });
    } else if (mode === "create") {
      setFormData(initialFormData);
    }
    setError(null);
  }, [user, mode]);

  const handleInputChange = (field: keyof UserFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: unknown } }
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value as string,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.username || !formData.firstName || !formData.lastName) {
      setError("Please fill in all required fields (Email, Username, First Name, Last Name)");
      return false;
    }
    
    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const requestBody = {
        email: formData.email,
        login: {
          username: formData.username,
          ...(mode === "create" && { password: "temporarypassword" }),
        },
        name: {
          first: formData.firstName,
          last: formData.lastName,
          title: formData.title,
        },
        gender: formData.gender,
        ...(formData.phone && { phone: formData.phone }),
        ...(formData.cell && { cell: formData.cell }),
        location: {
          street: {
            number: parseInt(formData.streetNumber) || 0,
            name: formData.streetName,
          },
          city: formData.city,
          state: formData.state,
          country: formData.country,
          postcode: formData.postcode,
        },
      };

      const url = mode === "create" 
        ? "https://user-api.builder-io.workers.dev/api/users"
        : `https://user-api.builder-io.workers.dev/api/users/${user?.login.uuid}`;
      
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      onUserUpdated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${mode} user`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: "80vh" }
      }}
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {mode === "create" ? "Add New Customer" : "Edit Customer"}
          </Typography>
          <IconButton onClick={handleClose} disabled={loading}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {mode === "edit" && user && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Avatar
              src={user.picture.medium}
              sx={{ width: 60, height: 60 }}
            >
              {getInitials(user.name.first, user.name.last)}
            </Avatar>
            <Box>
              <Typography variant="h6">
                {user.name.first} {user.name.last}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Customer ID: {user.login.uuid}
              </Typography>
            </Box>
          </Box>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleInputChange("email")}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Username"
                value={formData.username}
                onChange={handleInputChange("username")}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <FormControl fullWidth disabled={loading}>
                <InputLabel>Title</InputLabel>
                <Select
                  value={formData.title}
                  onChange={handleInputChange("title")}
                  label="Title"
                >
                  <MenuItem value="Mr">Mr</MenuItem>
                  <MenuItem value="Mrs">Mrs</MenuItem>
                  <MenuItem value="Ms">Ms</MenuItem>
                  <MenuItem value="Miss">Miss</MenuItem>
                  <MenuItem value="Dr">Dr</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4.5}>
              <TextField
                required
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={handleInputChange("firstName")}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={4.5}>
              <TextField
                required
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={handleInputChange("lastName")}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={loading}>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={formData.gender}
                  onChange={handleInputChange("gender")}
                  label="Gender"
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom fontWeight={600} sx={{ mt: 2 }}>
                Contact Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone}
                onChange={handleInputChange("phone")}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cell Phone"
                value={formData.cell}
                onChange={handleInputChange("cell")}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom fontWeight={600} sx={{ mt: 2 }}>
                Address Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Street Number"
                type="number"
                value={formData.streetNumber}
                onChange={handleInputChange("streetNumber")}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={9}>
              <TextField
                fullWidth
                label="Street Name"
                value={formData.streetName}
                onChange={handleInputChange("streetName")}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={handleInputChange("city")}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State/Province"
                value={formData.state}
                onChange={handleInputChange("state")}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                value={formData.country}
                onChange={handleInputChange("country")}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Postal Code"
                value={formData.postcode}
                onChange={handleInputChange("postcode")}
                disabled={loading}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? "Saving..." : (mode === "create" ? "Add Customer" : "Save Changes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
